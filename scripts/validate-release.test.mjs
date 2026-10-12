import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateRelease } from './validate-release.mjs';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'snipvia-release-check-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const files = [];
  let sha256 = '';
  for (const arch of ['arm64', 'x64']) for (const ext of ['zip', 'dmg']) {
    const url = `Snipvia-0.3.0-${arch}.${ext}`, content = Buffer.from(`synthetic ${arch} ${ext}`);
    await writeFile(join(directory, url), content);
    files.push({ url, size: content.length, sha512: createHash('sha512').update(content).digest('base64') });
    sha256 += `${createHash('sha256').update(content).digest('hex')}  ${url}\n`;
  }
  const info = { version: '0.3.0', files, path: files[0].url, sha512: files[0].sha512, releaseDate: '2026-10-12T00:00:00Z' };
  await writeFile(join(directory, 'SHA256SUMS.txt'), sha256);
  await writeFile(join(directory, 'latest-mac.yml'), JSON.stringify(info));
  return { directory, info };
}
test('两架构最终清单通过，校验结果不宣称验证了签名', async t => {
  const f = await fixture(t);
  assert.equal((await validateRelease(f.directory, 'v0.3.0')).mode, 'mac-auto-update');
  assert.equal((await validateRelease(f.directory, 'v0.3.0')).signatureVerified, false);
});
test('拒绝错误 Tag 和清单版本', async t => {
  const f = await fixture(t);
  await assert.rejects(validateRelease(f.directory, '../../unsafe'), /Tag/);
  f.info.version = '0.4.0'; await writeFile(join(f.directory, 'latest-mac.yml'), JSON.stringify(f.info));
  await assert.rejects(validateRelease(f.directory, 'v0.3.0'), /版本/);
});
test('拒绝改动文件、未知文件和符号链接', async t => {
  const f = await fixture(t), file = join(f.directory, f.info.files[0].url), content = await readFile(file);
  await writeFile(file, 'changed'); await assert.rejects(validateRelease(f.directory, 'v0.3.0'), /SHA-256/);
  await writeFile(file, content); await writeFile(join(f.directory, '.env'), 'synthetic');
  await assert.rejects(validateRelease(f.directory, 'v0.3.0'), /白名单/);
  await rm(join(f.directory, '.env')); await rm(file); await symlink(join(f.directory, f.info.files[1].url), file);
  await assert.rejects(validateRelease(f.directory, 'v0.3.0'), /普通文件/);
});
test('拒绝伪造 SHA-512、大小和下载地址', async t => {
  const f = await fixture(t);
  for (const [key, value] of [['sha512', 'a'.repeat(86) + '=='], ['size', 1], ['url', 'https://example.invalid/package.zip']]) {
    const copy = structuredClone(f.info); copy.files[0][key] = value;
    await writeFile(join(f.directory, 'latest-mac.yml'), JSON.stringify(copy));
    await assert.rejects(validateRelease(f.directory, 'v0.3.0'));
  }
});
test('历史发行需明确允许，且只标记为手动安装', async t => {
  const f = await fixture(t); await rm(join(f.directory, 'latest-mac.yml'));
  await assert.rejects(validateRelease(f.directory, 'v0.3.0'), /历史/);
  assert.equal((await validateRelease(f.directory, 'v0.3.0', { allowLegacy: true })).mode, 'manual-only');
});

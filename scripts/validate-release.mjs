import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ensure = (condition, message) => { if (!condition) throw new Error(message); };
async function digest(file, algorithm, encoding) {
  const hash = createHash(algorithm);
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest(encoding);
}

export async function validateRelease(directory, tag, { allowLegacy = false } = {}) {
  ensure(/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(tag), 'Tag 必须是 v 加三段正式版本号');
  const version = tag.slice(1);
  const macNames = ['arm64', 'x64'].flatMap(arch => ['zip', 'dmg'].map(ext => `Snipvia-${version}-${arch}.${ext}`));
  const docNames = ['INSTALL-macOS-zh-CN.md', 'INSTALL-Windows-zh-CN.md', 'RELEASE_NOTES-zh-CN.md'];
  const allowed = new Set([...macNames, `Snipvia-Setup-${version}-x64.exe`, ...docNames, 'latest-mac.yml', 'SHA256SUMS.txt']);
  const names = await readdir(directory);
  for (const name of names) {
    ensure(allowed.has(name), `发行文件不在白名单：${name}`);
    const stat = await lstat(join(directory, name));
    ensure(stat.isFile() && !stat.isSymbolicLink() && stat.size > 0, `发行文件必须是非空普通文件：${name}`);
  }
  ensure(names.includes('SHA256SUMS.txt'), '缺少 SHA256SUMS.txt');
  const checksums = new Map();
  for (const line of (await readFile(join(directory, 'SHA256SUMS.txt'), 'utf8')).trim().split('\n')) {
    const match = /^([a-f0-9]{64})  ([A-Za-z0-9._-]+)$/.exec(line);
    ensure(match && allowed.has(match[2]) && match[2] !== 'SHA256SUMS.txt', 'SHA-256 清单内容无效');
    ensure(!checksums.has(match[2]), 'SHA-256 清单重复');
    checksums.set(match[2], match[1]);
  }
  for (const [name, expected] of checksums) {
    ensure(names.includes(name), `SHA-256 清单文件缺失：${name}`);
    ensure(await digest(join(directory, name), 'sha256', 'hex') === expected, `SHA-256 不匹配：${name}`);
  }
  for (const name of names.filter(name => !['latest-mac.yml', 'SHA256SUMS.txt'].includes(name))) {
    ensure(checksums.has(name), `文件没有 SHA-256：${name}`);
  }
  if (!names.includes('latest-mac.yml')) {
    ensure(allowLegacy, '缺少自动更新清单；历史手动包需显式 --allow-legacy');
    ensure(names.some(name => /\.(dmg|exe)$/.test(name)), '没有安装包');
    return { tag, mode: 'manual-only', files: names.sort(), signatureVerified: false };
  }
  let info;
  try { info = JSON.parse(await readFile(join(directory, 'latest-mac.yml'), 'utf8')); }
  catch { throw new Error('更新清单必须使用项目发布器的 JSON 格式 YAML'); }
  ensure(info.version === version && Array.isArray(info.files) && info.files.length === 4, '更新清单版本或架构文件数量不匹配');
  const seen = new Set();
  for (const file of info.files) {
    ensure(macNames.includes(file.url) && !seen.has(file.url), '更新清单文件名无效或重复');
    seen.add(file.url);
    ensure(names.includes(file.url), `更新文件缺失：${file.url}`);
    const stat = await lstat(join(directory, file.url));
    ensure(Number.isSafeInteger(file.size) && file.size === stat.size, `更新文件大小不匹配：${file.url}`);
    ensure(/^[A-Za-z0-9+/]{86}==$/.test(file.sha512), 'SHA-512 格式无效');
    ensure(await digest(join(directory, file.url), 'sha512', 'base64') === file.sha512, `SHA-512 不匹配：${file.url}`);
  }
  ensure(info.path === info.files[0].url && info.sha512 === info.files[0].sha512, '兼容清单字段不匹配');
  ensure(typeof info.releaseDate === 'string' && Number.isFinite(Date.parse(info.releaseDate)), '发行日期无效');
  return { tag, mode: 'mac-auto-update', files: names.sort(), signatureVerified: false };
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    ensure(process.argv.length === 4 || process.argv.length === 5 && process.argv[4] === '--allow-legacy', '用法：node scripts/validate-release.mjs <目录> v<version> [--allow-legacy]');
    console.log(JSON.stringify(await validateRelease(resolve(process.argv[2]), process.argv[3], { allowLegacy: process.argv[4] === '--allow-legacy' }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

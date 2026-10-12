# 截然 · Snipvia

截然是一款截图优先的 AI 桌面工具：截取屏幕内容，与模型对话，并在本地 Markdown 笔记中整理结果。

本仓库提供桌面安装包、发行说明与客户端更新清单。应用源码在独立私有仓库维护；此处公开的是分发资料与校验工具。

## 下载与安装

[查看最新发行版本](https://github.com/yuyeyuyy/Snipvia-releases/releases/latest) · [全部版本](https://github.com/yuyeyuyy/Snipvia-releases/releases)

| 当前版本 | 下载 | 平台 |
| --- | --- | --- |
| v0.2.2 macOS | [Apple 芯片 DMG](https://github.com/yuyeyuyy/Snipvia-releases/releases/download/v0.2.2/Snipvia-0.2.2-arm64.dmg) | macOS 14+，Apple 芯片 |
| v0.2.2 macOS | [Intel DMG](https://github.com/yuyeyuyy/Snipvia-releases/releases/download/v0.2.2/Snipvia-0.2.2-x64.dmg) | macOS 14+，Intel；真机兼容性待完整验收 |
| v0.2.1 Windows 预览版 | [EXE 安装包](https://github.com/yuyeyuyy/Snipvia-releases/releases/download/v0.2.1/Snipvia-Setup-0.2.1-x64.exe) | Windows 11，x64；未代码签名 |

**v0.2.2 Mac 版启用应用内更新**，安装包经过 Developer ID 签名与 Apple 公证。首次从 v0.2.1 或更早版本升级，请手动下载 DMG 安装；之后支持应用内检查、下载及确认重启更新。[查看 v0.2.2 更新说明](docs/RELEASE_NOTES_v0.2.2.md)。

v0.2.1 是原发行包的迁移副本：Mac 临时签名、未公证，Windows 未代码签名，都没有自动安装更新能力。本次只更新 Mac；已有 Windows 预览版继续手动安装，完整真机兼容性仍需检查。

安装步骤见[安装指南](docs/INSTALL.md)，变更说明与 `SHA256SUMS.txt` 在对应 Release 中提供。请从同一版本下载并校验文件。GitHub 页面自动生成的 Source code 压缩包只包含本分发仓库资料，桌面软件请下载 DMG、ZIP 或 EXE。

## 应用内更新

包含更新功能并启用签名更新的正式 Mac 版本支持：后台检查 → 展示版本和说明 → 用户下载 → 保存笔记 → 用户确认重启安装。下载完成不会自动退出软件。

更新端点无需登录 GitHub：

```text
https://api.github.com/repos/yuyeyuyy/Snipvia-releases/releases/latest
https://github.com/yuyeyuyy/Snipvia-releases/releases/download/v<version>/latest-mac.yml
```

正式 Mac 自动更新发行包含两种架构的签名、公证 ZIP / DMG 和最终更新清单；旧安装包需要先手动升级到包含该功能的版本。Windows 当前通过发行页手动更新。详见[更新机制](docs/UPDATES.md)。

## 问题反馈

可在 [Issues](https://github.com/yuyeyuyy/Snipvia-releases/issues) 提交已脱敏的复现步骤、应用版本和系统信息。请勿上传 API Key、账号验证码、个人笔记、原始私人截图或完整未脱敏日志。安全问题参见 [SECURITY.md](SECURITY.md)。

## 维护与校验

源码构建、平台测试、签名与 Apple 公证在私有工程或受信发布环境执行。本仓库执行公开发行文件的哈希与清单校验，不持有模型 Key、源码仓库 Token 或 Apple 签名凭据。

```bash
node --test scripts/validate-release.test.mjs
node scripts/validate-release.mjs <发行文件目录> v<version>
```

历史手动安装包可显式使用 `--allow-legacy`，不会被判定为自动更新发行。公开校验不能替代平台签名、公证与真实设备验收。发布维护者参见[维护指南](docs/MAINTAINERS.md)。

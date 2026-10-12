# 客户端更新与发行清单

## 客户端流程

正式安装版启动后在后台检查一次正式 Release。用户也可在设置页手动检查。发现更高版本时显示版本与 Release 更新说明；用户点击下载后显示进度、校验完整性，下载完成仍保留应用运行。

点击「重启并更新」后，先确认截图 / AI 任务完成并保存笔记，再由 Mac 原生更新器验证签名、替换应用并重启。用户数据目录继续使用原位置。Windows 当前保留手动下载。

客户端只访问本公开仓库，不需要 GitHub Token，不发送账号凭据、模型 Key、截图或笔记。普通下载服务仍可看到请求 IP。

## 自动更新发行文件

```text
Snipvia-<version>-arm64.zip
Snipvia-<version>-x64.zip
Snipvia-<version>-arm64.dmg
Snipvia-<version>-x64.dmg
latest-mac.yml
SHA256SUMS.txt
```

`latest-mac.yml` 使用 JSON 格式的 YAML 子集，包含 `version`、`files`、`path`、`sha512` 和 `releaseDate`。`files` 的每项提供规范文件名、最终字节数与 Base64 SHA-512。Tag 使用 `v<version>`；版本必须与安装包及清单一致，不用旧版本清单指向新版本文件。

只有完成签名、公证、Staple 与验收后的最终文件才进入清单。Mac 原生更新使用 ZIP，DMG 供手动安装。客户端将下载固定到选中的具体 Release，避免下载期间另一个版本改变“最新”地址。

本仓库校验器核对 Tag、文件白名单、SHA-256、SHA-512 和大小。Linux 工作流不能验证 Mac Developer ID 或 Apple 公证，签名与平台验收必须在受信发布环境完成。

## 迁移的旧版本

v0.2.1 迁移资产保持原字节与原 SHA-256，仅供手动安装，没有 `latest-mac.yml`。它不包含后来加入的更新功能。旧安装包需先手动安装一次包含新更新源与更新功能的版本。

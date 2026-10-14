# 安装与升级

## macOS

当前 v0.2.3 最低 macOS 14，提供 Developer ID 签名、Apple 公证的独立 DMG：`arm64` 为 Apple 芯片，`x64` 为 Intel。Intel 真机兼容性仍需完整验收。v0.2.1 迁移包只有 Apple 芯片版本，采用临时签名且没有公证；旧包的限制保持原说明。

打开 DMG，将 Snipvia 拖入「应用程序」。替换旧版前退出应用。用户数据与笔记使用独立存储位置，升级前可自行备份重要内容。

首次截图按 macOS 提示授予「录屏与系统录音」权限。更新包提供哪些平台、签名和公证情况，以该 Release 的实际说明为准。

## Windows

下载对应的 `Snipvia-Setup-<version>-x64.exe`，退出旧版后运行安装器。当前安装包未代码签名，真实 Windows、多屏与混合 DPI 兼容性仍有待完整验收。具体安装步骤见 Release 附件 `INSTALL-Windows-zh-CN.md`。

## 校验下载

各 Release 的 `SHA256SUMS.txt` 列出最终文件哈希。macOS / Linux 可执行：

```bash
shasum -a 256 Snipvia-<version>-arm64.dmg
```

Windows PowerShell：

```powershell
Get-FileHash .\Snipvia-Setup-<version>-x64.exe -Algorithm SHA256
```

将结果与同一个 Release 的清单比较。哈希校验用于确认文件完整性；正式 Mac 版本还由系统验证开发者签名。

## 应用内更新

v0.2.2 起，正式签名 Mac 版在「设置 → 关于 → 软件更新」检查、下载并明确确认「重启并更新」。已安装 v0.2.2 可以直接更新到 v0.2.3；从 v0.2.1 或更早版本升级需要先手动安装一次新版 DMG。开发版及当前 Windows 包继续使用手动升级。

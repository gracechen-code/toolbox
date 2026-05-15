# 常用工具箱 (Toolbox)

## 项目概述

一个跨平台的 Web 工具箱，支持 Ubuntu 浏览器访问和 Android 添加到主屏幕使用。

## 技术栈

- **HTML/CSS/JavaScript** 原生开发，无框架依赖
- **PWA** 支持离线缓存和添加到主屏幕
- **qrcodejs** 通过 CDN 引入生成二维码

## 目录结构

```
tools/
├── index.html              # 主页导航
├── manifest.json           # PWA 配置
├── sw.js                   # Service Worker（离线缓存）
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── stopwatch.js        # 秒表逻辑
│   ├── timer.js            # 计时器逻辑
│   ├── counter.js          # 计数器逻辑
│   ├── hex-ascii.js        # 十六进制转换逻辑
│   └── qrcode.js           # 二维码生成逻辑
└── pages/
    ├── stopwatch.html      # 秒表页面
    ├── timer.html          # 计时器页面
    ├── counter.html        # 计数器页面
    ├── hex-ascii.html      # 十六进制转换页面
    └── qrcode.html         # 二维码生成页面
```

## 功能列表

| 工具 | 说明 |
|------|------|
| 秒表 | 开始/暂停/复位、圈速记录、每条圈速可添加备注 |
| 计时器 | 自定义时分秒、倒计时、浏览器通知提醒 |
| 计数器 | +1/-1 计数，可命名多个计数器，数据本地保存 |
| 十六进制 ↔ ASCII | 双向转换，支持批量转换 |
| 二维码生成 | 预设字段（Wi-Fi_SSID、Wi-Fi_PWD、Volumn）+ 自定义字段，格式：`#<HPRTSetting>#$字段$@值<ESC>...<CR>` |

## 开发规范

- 不使用前端框架，保持原生 HTML/CSS/JS
- 每个工具独立页面 + 独立 JS 文件
- 数据使用 localStorage 本地存储
- 样式统一使用 `css/style.css` 中的 CSS 变量
- 新增工具需在 `sw.js` 的 ASSETS 数组中添加缓存，并升级 CACHE_NAME 版本号
- 页面引用 CSS/JS 时添加版本号参数（如 `?v=7`）强制刷新缓存

## 部署

### GitHub Pages

仓库已推送到 `https://github.com/gracechen-code/toolbox`

访问地址：`https://gracechen-code.github.io/toolbox/`

### 推送命令

```bash
cd tools
git add .
git commit -m "提交说明"
git push origin main
```

### 本地调试

```bash
cd tools
python3 -m http.server 8080
```

访问 `http://localhost:8080`

## 二维码生成格式

```
#<HPRTSetting>#$字段1$@值1<ESC>#$字段2$@值2<CR>
```

- `<ESC>`: ASCII `0x1B`（仅用于字段之间分隔）
- `<CR>`: ASCII `0x0D`（结束符）
- 单字段时不添加 ESC，直接跟 CR

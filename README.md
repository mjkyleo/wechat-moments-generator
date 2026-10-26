# 微信朋友圈模拟器（WeChat Moments Generator）

**在线体验：https://wechat-moments-simulator-js5nabj1o8q.qoder.website** （Qoder Sites 托管的静态构建，手机/电脑都适配）

本地运行的朋友圈 feed 流模拟工具：高度还原真机截图，可配置每条动态（昵称/头像/正文/媒体/时间/点赞/评论），一键导出 PNG 长图；内置 Remotion 滚动动画预览与 MP4 导出。

数据全部为虚构内容，只在浏览器本地生成与保存（localStorage），不上传任何服务器；`npm run build` 产物即在线版使用的 `dist/`。

## 启动

```bash
npm install
npm run dev        # http://localhost:5173
```

## 功能

- **三栏布局**：左侧预设库（分组可折叠：281 个昵称池 / 正文模板 / 评论模板 / 图片素材）→ 中间手机预览（375 宽，实时渲染）→ 右侧控制面板；屏幕宽度 <1280px 自动切换成单栏，用顶部分段按钮在「手机预览 / 编辑面板 / 预设库」之间切换，预览画布按可用宽度等比缩小且无横向滚动
- **预设 JSON 统一管理**：全部预设数据集中在 `public/data/default.json`（昵称池、正文/评论模板、默认状态栏图标、一整批内置动态）；预设库顶部支持**导入 JSON / 导出 JSON / 恢复内置**，改文件即可整库更新，导入时带字段校验与错误提示。格式与 AI 生成提示词见 [docs/预设JSON导入说明.md](docs/预设JSON导入说明.md)
- **6 种媒体类型**：纯文字 / 单图（四档版式：常规横版、竖版、全景横图、长图）/ 九宫格（2 张一行两格、4 张 2×2、其余三列）/ 视频号卡片 / 链接卡片 / 广告卡片（外层图 16:9 + 查看详情）
- **点赞评论块**：空心 ♡ + 逗号分隔蓝色昵称（`, `）、`昵称: 内容`、`A 回复 B: 内容`（"回复"灰色）；长正文超 6 行折叠成蓝色「全文」
- **动态管理**：增删改、上移/下移、复制、展开编辑，全部实时预览
- **启动即有内容**：首次打开直接载入 `public/data/default.json` 里预置的 12 条动态（覆盖 6 种媒体类型）；顶栏「重新随机生成」或 JSON 里不带 `moments` 时，改从昵称/模板即时随机生成 4-6 条；也可「一键生成」指定位数
- **图片**：上传本地图片（转 dataURL）或点「随机配图」从素材库补齐；内置 **110 张真实图片素材**（`public/preset-images/`），**头像与配图通用**——随机生成的头像与配图、编辑器「换头像」「随机配图」按钮都取自这一份素材，预设库「图片素材」分组点击缩略图即复制 `photo:N` 引用（可粘贴到任意图片输入框），悬停可逐张下载
- **图片引用**：`photo:N` → 素材库第 N 张（1-110，与文件名 1:1，同源静态文件不占 localStorage；越界按 110 取模回绕）；直接填 http/dataURL 则原样保存
- **全局**：浅色/深色主题、状态栏时间、电池、5G/4G、**状态栏图标可配置（16 种内置 + 上传自定义图标，位置支持时间左侧/靠左/居中/靠右）**、顶部封面开关
- **草稿自动保存**：localStorage，刷新不丢
- **导出 PNG 长图**：2x / 3x 倍率，html-to-image 截取整条 feed（不含控制面板）；窄屏上等比缩小显示的只是预览外壳，导出仍是 375 宽的完整尺寸
- **Remotion 滚动动画**：中间预览区「Remotion 滚动动画」标签内嵌 `<Player>`，实时播放当前草稿的滚动效果

## 隐私说明（发布前必读）

内置昵称池（281 个）、正文/评论模板与 12 条内置动态**全部为虚构内容**，统一存放在 `public/data/default.json`，不含任何真实用户信息。上传的图片、填写的昵称等只保存在本机浏览器 localStorage 中，不会上传到任何服务器。发布/分享前请勿把个人真实数据写入 `public/data/default.json`（若导入了含真实数据的 JSON，请重新「恢复内置」再导出）。

> 已做过一次全仓核对：把仓库内源/数据文件与《方案 v2》§5.1 标注的「好友真实昵称」名单逐条比对，`public/data/default.json` 现命中数为 0（昵称池 281 个、无重复）。上级目录的方案 md 本身含该真实名单，公开发布时**不要把它带进仓库**。

> **图片素材版权提示**：`public/preset-images/` 的 110 张图收集自知乎公开专栏《好看的微信头像大全300张》（多为网络转载图，原作者不明），仅作本地演示素材（头像与配图共用）。若项目要正式商业发布，建议替换为自有或明确 CC 授权的图片。

## 导出 MP4（Remotion CLI）

```bash
npx remotion render MomentsScroll out/moment-scroll.mp4
npx remotion studio        # Remotion Studio 预览（渲染 src/remotion/Root.tsx 注册的示例草稿）
```

> CLI 渲染 `src/remotion/Root.tsx` 注册的 `MomentsScroll`，草稿由 `buildSeedDraft()` 生成（`data/default.json` 自带 12 条动态时直接用它们，没带则 `buildRandomDraft()` 现取现生成；Remotion 无头服务器把 `public/` 挂在 `/public/` 下，入口 `src/remotion/index.ts` 据此设置素材前缀，`calculateMetadata` 先加载 `data/default.json` 再算滚动时长，否则会生成空动态）。浏览器内的日常导出请用顶栏「导出 PNG」按钮（作用于当前编辑中的草稿）。

## 技术栈

Vite 7 + React 19 + TypeScript + Tailwind CSS 3 + Zustand + lucide-react + html-to-image + Remotion 4（@remotion/player）。

**两套设计体系，互不混用：**

- **手机内的微信 UI**（`src/components/*`）：全部使用内联样式（非 Tailwind 类），颜色与字号取自 WeUI 官方规范（`weui-wxss`）+ 微信设计指南 FG/BG 层级——浅色 BG-0 `#EDEDED` / BG-1 `#F7F7F7` / BG-2 `#F2F2F2` / FG-0 `#191919` / FG-1 `rgba(0,0,0,.55)` / FG-2 `rgba(0,0,0,.3)`（时间、注释）/ FG-3 `rgba(0,0,0,.1)`（分割线）/ LINK `#576B95` / RED `#FA5151` / BRAND `#07C160`，深色 BG-0 `#111111` / FG-0 `rgba(255,255,255,.85)` / LINK `#7D90A9`；cell 正文 17px、次级 14px、时间 12px、行高 1.41176471，头像 40px 圆角 3px、头像与文本间距 10px、卡片左右内边距 15px，分割线用官方做法 `1px + scaleY(.5)` 得到 0.5px 细线。token 与布局常量集中在 `src/utils/theme.ts`（`themeOf` / `LAYOUT` / `CONTENT_WIDTH` / `GRID_CELL` / `hairline`）。内联样式保证浏览器导出与 Remotion 无头渲染像素一致，组件在编辑器、Player、CLI 三处复用同一套代码。
- **应用外壳**（顶栏/面板/按钮，`src/App.tsx` + `src/panels/*`）：采用 Corporate Clean 设计体系（blue-600 主色、gray-50~300 灰阶、rounded-lg/xl、shadow-sm→md、≤200ms 过渡、focus 焦点环），样式集中在 `src/index.css` 的 `.btn/.field/.chip/.card/.section/.tab` 等类；中间预览区用 `.preview-stage`（slate-200 内阴影）与两侧白色面板拉开对比。

## 目录

```
docs/               # 预设JSON导入说明.md（字段/校验/图片编号 + 可直接丢给 AI 的提示词）
src/
├── components/     # 手机外框、状态栏、动态条目、6 种媒体、点赞评论块
├── panels/         # 控制面板：全局设置 / 动态列表 / 单条编辑器 / 预设库
├── remotion/       # MomentsScroll 组合 + Root 注册（CLI 用）
├── store/          # Zustand 草稿状态（persist 到 localStorage）+ 预设库状态（JSON 导入导出）
├── data/           # 随机生成 / 导入 JSON 动态转草稿 / 内置状态栏图标
├── types/          # Moment / Comment / Draft
└── utils/          # 素材(photo:N → preset-images) / WeUI 主题色 / 导出 / 随机 / 时间标签
```

## 逼真度自检（对照方案 §10 + WeUI 规范）

逗号分隔 · 空心心形 · 白色 feed 背景 · 头像圆角 3px · 英文冒号 · 回复灰色 · 单图四档（2 格长边 / 3 栏全景 / 2 栏长图）· 九宫格 2 张两列·4 张 2×2·其余三列（格 95.7px / 间距 4px）· 长文 6 行折叠「全文」· 广告 16:9 + 查看详情 · 视频号黑底白圈蓝字 · 链接卡片图标+两行截断 · WeUI 色板 #576B95 / #191919 / rgba(0,0,0,.3) · 导航 #EDEDED · 正文 17px / 次级 14px / 时间 12px · 0.5px 分割线 · 状态栏图标齐全。

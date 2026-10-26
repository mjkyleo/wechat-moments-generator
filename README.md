# 微信朋友圈模拟器（WeChat Moments Generator）

**在线体验：https://wechat-moments-simulator-js5nabj1o8q.qoder.website** （Qoder Sites 托管的 `dist/` 静态构建，手机 / 电脑都适配）
**仓库：https://github.com/mjkyleo/wechat-moments-generator**

高仿真微信朋友圈 feed 流生成器：在 375 宽的手机画布里逐条编辑动态（昵称 / 头像 / 正文 / 媒体形态 / 位置 / 时间 / 点赞 / 评论），实时预览，一键导出整条 feed 的 PNG 长图；另配 Remotion 滚动动画预览与 MP4 命令行渲染。

所有内置文案、昵称、图片都是**虚构或本地素材**，运行期数据只落在浏览器 localStorage，不请求任何后端。`npm run build` 的产物 `dist/` 就是在线版正在使用的那份文件。

---

## 目录

- [特性总览](#特性总览)
- [快速开始](#快速开始)
- [界面与响应式](#界面与响应式)
- [数据模型与状态](#数据模型与状态)
- [内置数据 public/data/default.json](#内置数据-publicdatadefaultjson)
- [图片引用规则](#图片引用规则)
- [微信 UI 规范落地](#微信-ui-规范落地)
- [导出 PNG 长图](#导出-png-长图)
- [Remotion 滚动动画与 MP4](#remotion-滚动动画与-mp4)
- [目录结构](#目录结构)
- [开发、检查与验证](#开发检查与验证)
- [已知限制与坑](#已知限制与坑)
- [部署到任意静态托管](#部署到任意静态托管)
- [隐私说明（发布前必读）](#隐私说明发布前必读)
- [逼真度自检清单](#逼真度自检清单)

---

## 特性总览

**动态形态（6 种，`MediaType`）**

| 值 | 呈现 | 图片张数 | 关键参数 |
| --- | --- | --- | --- |
| `text` | 纯文字 | 0 | — |
| `single-image` | 单图，四档版式 | 1 | `orientation`：`landscape` 宽 195.33px / `portrait` 高 195.33px / `panorama` 满栏宽 + `aspect-ratio: 3/1` / `tall` 高 195.33px、宽约 2/3 格裁切 |
| `grid` | 宫格 | ≤9 | 2 张与 4 张走两列（2×2），其余三列；单格 95.67px、间距 4px、圆角 3px |
| `video-channel` | 视频号卡片 | 1（封面） | 16:9 黑底封面 + 白圈播放键，标题 `视频号·<videoChannelTitle>`，封面优先 `videoCover`，缺省回落 `images[0]`，都没有则纯黑 |
| `link` | 链接卡片 | 0–1 | 44px 缩略图（无图时用 `Link2` 图标占位）+ 标题两行截断 |
| `ad` | 朋友圈广告 | 1 | 外层图满栏宽 16:9 + 文案四行截断 + 蓝色「查看详情」+ 可选右上角「广告 ∨」角标 |

**其它能力**

- **一键生成**：顶栏指定 1–20 条，按权重随机媒体形态（单图 3 / 九宫格 2.5 / 纯文字 1.5 / 视频号 1 / 链接 0.5，**广告不在随机权重内**，只能手动添加）；作者从昵称池无重复抽取，点赞 2–11 人，65% 概率带 1–3 条评论，评论可带「回复」。
- **启动即有内容**：首次打开（本机尚无草稿时）直接载入 `default.json` 预置的 12 条动态，覆盖全部 6 种形态；内置数据不带 `moments` 时回落到随机生成 4–6 条。顶栏「重新随机生成」随时换一批纯随机草稿。
- **动态管理**：新增 6 种类型、删除、复制、上移 / 下移、手风琴式展开单条编辑器，全部实时反映到中间预览。
- **全局设置**：浅色 / 深色主题、状态栏时间文本、电池百分比（≤20% 自动变红 `#FF453A`）、5G / 4G 信号、顶部封面开关、导出倍率 2x / 3x。
- **状态栏图标**：16 种内置图标（铃铛 / 手机 / 相机 / 闹钟 / 时钟 / 音乐 / 耳机 / 手表 / 游戏 / 蓝牙 / 定位 / 导航 / 健康 / 晴天 / 勿扰 / WiFi）+ 上传任意透明图（转 dataURL），可点击开关并**按点击顺序排列**，位置支持时间左侧 / 靠左 / 居中 / 靠右；内置数据默认 `location, music, moon`。
- **长正文折叠**：估算超过约 6 行（按 17px 字号、295px 栏宽、每行约 17 个全角字）折叠成 WeUI 蓝「全文」，点击展开。
- **位置行**：`location` 非空时在时间与「⋯」上方渲染 `📍 <位置>` 蓝色文字。
- **预设库**：昵称池 / 正文模板 / 评论模板 / 图片素材四个可折叠分组，点任意条目即复制到剪贴板；支持**导入 JSON（带字段校验与中文错误提示）/ 导出 JSON（`moments-default.json`）/ 恢复内置**。
- **草稿自动保存**：每次改动写入 localStorage，顶栏显示「草稿已保存 HH:MM:SS」。
- **导出 PNG 长图**：只截手机画布（不含外壳与面板），2x / 3x，文件名 `wechat-moments-<时间戳>.png`。
- **Remotion**：「Remotion 滚动动画」标签内嵌 `<Player>` 播放当前草稿的匀速滚动；命令行 `npx remotion render MomentsScroll` 出 MP4，`npx remotion studio` 调参。

## 快速开始

要求 Node ≥ 20.19（Vite 7 的最低要求，开发时用的是 Node 24）、npm 10+。

```bash
npm install
npm run dev          # http://localhost:5173
```

| 命令 | 实际执行 | 说明 |
| --- | --- | --- |
| `npm run dev` | `vite` | 开发服务器，HMR |
| `npm run build` | `tsc -b && vite build` | 先全量类型检查，再产出 `dist/`（约 7 MB / 116 个文件） |
| `npm run preview` | `vite preview` | 本地静态服务 `dist/`，验证构建产物 |
| `npm run studio` | `remotion studio` | Remotion Studio（渲染 `src/remotion/Root.tsx` 注册的示例草稿，不是浏览器里的当前草稿） |
| `npm run render-video` | `remotion render MomentsScroll out/moment-scroll.mp4` | 命令行出片 |
| `npm run remotion -- <参数>` | `remotion <参数>` | 任意 Remotion CLI 透传 |

## 界面与响应式

桌面（≥1280px，即 Tailwind `xl`）是三栏，窄屏自动折叠成单栏：

```
≥1280px   [ 预设库 330px ] [ 手机预览 417px ] [ 控制面板 420px ]
<1280px   [ 分段切换：手机预览 | 编辑面板 N | 预设库 ]
          [ 当前选中的那一个面板，占满剩余高度 ]
```

实现要点都在 [`src/App.tsx`](src/App.tsx)：

- 三个面板始终挂载，用 `hidden` / `block` + `xl:block` 控制显隐，并用 `order-*` 让移动端顺序变成「预览 → 编辑面板 → 预设库」（桌面顺序是预设库在左）。切换只靠 CSS，不依赖 `matchMedia`。
- 顶栏在窄屏换成两行（第一行品牌 + 生成数量，第二行保存状态 + 随机 / 清空 / 导出），行高由 `h-16` 变成 `flex-wrap` 自适应。
- **手机画布等比缩小**：`ScaledCanvas` 用 `ResizeObserver` 读预览底座的内容宽，算出 `scale = min(1, 可用宽 / 375)`，把 `transform: scale()` 打在 PhoneFrame 的**外层包裹**上，并按缩放后的高度预留占位。这样 `toPng` 克隆的 PhoneFrame 自身不带 transform，导出的长图永远是 375 宽的原始尺寸——窄屏只是显示变小。
- 预览容器固定 `max-w-[417px]`（375 + 底座左右内边距 40 + 边框 2），保证桌面正好 1:1 不缩。
- 触屏设备（`@media (pointer: coarse)`）把 `.btn` / `.tab` / `.seg` / `.section-header` 抬到 `min-height: 44px`，并把 `.field` 字号提到 16px，避免 iOS Safari 聚焦输入框时整页放大。

## 数据模型与状态

类型定义集中在 [`src/types/moment.ts`](src/types/moment.ts)。

```ts
Draft    // 整份草稿
  coverImage? myName myAvatar showCover        // 顶部封面（默认关闭，封面是内置 SVG 渐变图）
  theme statusBarTime battery signalType        // 状态栏
  statusIcons[] statusIconsAlign exportScale    // 图标 16 内置 + dataURL 自定义；倍率 2 | 3
  moments[]
Moment   // 一条动态
  id authorName authorAvatar text mediaType images[] orientation
  videoChannelTitle? videoCover? linkTitle? adTag? location?
  timeLabel likes[] comments[]
Comment  // 一条评论
  id author replyTo? content
```

两个 store：

| store | 持久化 | 作用 |
| --- | --- | --- |
| `useDraftStore`（`src/store/useDraftStore.ts`） | **有**，localStorage key `wechat-moments-draft-v5`，`partialize` 只存 `draft` | 草稿本体与全部编辑动作：`setGlobal / addMoment / updateMoment / deleteMoment / duplicateMoment / moveMoment / generate / loadMoments / regenerate / clearAll / seedIfEmpty` |
| `usePresetStore`（`src/store/usePresetStore.ts`） | **没有**（每次启动重新加载） | 预设数据 `preset`、来源标记 `source: default / file / imported / none`、错误信息，以及 `loadDefault / importFromText / exportToFile` |

- `seedIfEmpty()` 只在「本机还没有任何草稿」（`savedAt === null` 且动态为空）时灌初始内容，不会覆盖用户已编辑的草稿。
- 草稿 key 做过 v1→v5 的迁移；`src/main.tsx` 仍会在启动时清掉 v1/v2/v3 的残留（那几版里存着从真机截图誊来的内容）。改数据结构时请继续**升 key 版本号**而不是原地改。
- 仅 DEV 构建暴露 `window.__presetStore` / `window.__draftStore`，方便控制台或自动化脚本直接驱动状态。

## 内置数据 public/data/default.json

唯一的一份内置数据，约 20 KB，改它即等于换掉整个内容库；结构见 [`docs/预设JSON导入说明.md`](docs/预设JSON导入说明.md)（含字段表、校验规则和一段可直接丢给 AI 的生成提示词）。

```jsonc
{
  "version": 1,
  "nicknames": [],          // 281 个虚构昵称
  "textTemplates": {},      // 9 个分类 / 70 条正文：干饭日常 学习打卡 深夜emo 生活琐碎 天气心情 周末出行 运动健身 随手拍记录 吐槽日常
  "commentTemplates": {},   // 6 个分类 / 42 条评论：干饭评论 学习评论 夸夸评论 深夜互动 出行评论 自嘲吐槽
  "defaultStatusIcons": ["location", "music", "moon"],
  "moments": []             // 12 条预置动态：纯文字 2 / 单图 4 / 九宫格 3 / 视频号 1 / 链接 1 / 广告 1
}
```

- `textTemplates` 里如果存在 `视频号`、`链接` 两个分类，随机生成会优先用它们给对应形态配文；内置数据没有这两个分类，于是回落到通用正文池。
- `moments` 可整段省略，省略后启动走随机生成。
- 加载路径带回落：先试当前 `assetBase`（Vite 是 `/`，Remotion 无头是 `/public/`），再试另一个，两个都不通才在预设库报错。
- 校验规则（`parsePreset`）：`nicknames` 必须是非空字符串数组；`textTemplates` / `commentTemplates` 必须是对象且至少一个分类、分类值为数组；`moments[i].authorName` 非空、`text` 必须是字符串、`comments[i]` 需要 `author` 与 `content`；其余字段全部可选，缺省由 `fromPresetMoment()` 补齐。

## 图片引用规则

图片字段（`authorAvatar`、`images[]`、`videoCover`、上传的图）只认两种写法：

```
photo:N    → /preset-images/<NNN>.<ext>，N 从 1 开始、与文件名 1:1（001/010/013/017 是 png，其余 jpg）
             越界按 110 取模回绕：photo:111 = photo:1，photo:0 = photo:110
http(s):// 或 data: → 原样使用（编辑器「上传」按钮产出的就是 dataURL）
```

内置 110 张图片（`public/preset-images/`，5.8 MB）**头像与配图通用**：随机头像、随机配图、预设库「图片素材」分组都是同一份。旧的 `local:xxx` 占位引用已废弃，会被当成无效图片。

## 微信 UI 规范落地

**两套设计体系，互不混用。**

### 1）手机内的微信 UI（`src/components/*`）——WeUI

- **只用内联样式，不写 Tailwind 类，也不加 CSS transition / animation**。这些组件同时被编辑器 DOM、Remotion `<Player>` 与无头 CLI 复用，并且被 `html-to-image` 克隆；任何依赖外部 CSS 文件或动画的写法都会让导出与渲染结果失真。
- 颜色与尺寸取自 WeUI 官方规范（`weui-wxss`）+ 微信设计指南 FG/BG 层级，全部集中在 [`src/utils/theme.ts`](src/utils/theme.ts)：

| token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `page` (BG-0) | `#FFFFFF` | `#111111` | feed 页面底色 |
| `nav` | `#EDEDED` | `#1F1F1F` | 导航栏底色 |
| `text` (FG-0) | `#191919` | `rgba(255,255,255,.85)` | 正文 |
| `fg1` | `rgba(0,0,0,.55)` | `rgba(255,255,255,.5)` | 辅助文字 |
| `time`/`icon` (FG-2) | `rgba(0,0,0,.3)` | `rgba(255,255,255,.3)` | 时间、注释、「回复」 |
| `fg3` | `rgba(0,0,0,.1)` | `rgba(255,255,255,.1)` | 分割线 |
| `block` (BG-1) | `#F7F7F7` | `#1F1F1F` | 点赞评论块 |
| `bg2` (BG-2) | `#F2F2F2` | `#2C2C2C` | 图标占位块 |
| `name` (LINK) | `#576B95` | `#7D90A9` | 昵称、全文、查看详情、位置 |
| `red` | `#FA5151` | `#F45151` | 警示红 |

  另有 BRAND 微信绿 `#07C160` 作为规范色保留；深色下图片带 `rgba(255,255,255,.12)` 描边，避免黑图融进黑底。

- 布局常量（`LAYOUT` 及派生值，375 宽基准）：

```
cardPaddingX 15 · avatarSize 40（圆角 3px）· avatarGap 10 · gridGap 4 · bodyLineHeight 1.41176471
CONTENT_WIDTH = 375 - 15*2 - 40 - 10 = 295
GRID_CELL     = (295 - 4*2) / 3 = 95.67
SINGLE_MAX    = 95.67*2 + 4 = 195.33
字号：正文 / 昵称 17 · 评论与链接卡 14 · 位置 / 视频号标题 15 / 13 · 时间 12 · 状态栏时间 15
分割线：1px 高度 + scaleY(.5)（`hairline()`），得到真机那种 0.5px 细线
```

- 点赞评论块：空心 ♡ + 英文逗号加空格 `, ` 拼接的蓝色昵称列表；评论是 `昵称: 内容`，`A 回复 B` 里的「回复」用 FG-2 灰；点赞与评论同时存在时中间插一条 0.5px 细线。

### 2）应用外壳（`src/App.tsx` + `src/panels/*`）——Corporate Clean

blue-600 主色、gray-50~300 灰阶、`rounded-lg/xl`、shadow-sm→md、≤200ms 过渡、hover 上浮 + active 按压回弹、`:focus-visible` 带 offset 焦点环。样式集中在 [`src/index.css`](src/index.css) 的 `.btn / .btn-primary / .btn-selected / .field / .label / .chip / .card / .section / .link-btn / .tab / .seg / .preview-stage / .neu-toast / .icon-badge`。中间预览用 `.preview-stage`（slate-200 + 内阴影）与两侧白色面板拉开对比，窄屏自动收成 8px 内边距。

## 导出 PNG 长图

[`src/utils/exportPng.ts`](src/utils/exportPng.ts) 就一段：

```ts
toPng(node, { pixelRatio: 导出倍率, cacheBust: true, backgroundColor: themeOf(theme).page })
```

`node` 是 `PhoneFrame` 的根节点（状态栏 + 导航 + 整条 feed），所以面板、顶栏、分段按钮都不会进图。`html-to-image` 用该节点自身的 `clientWidth/clientHeight` 定尺寸，因此窄屏的外层 `transform: scale()` 不影响导出结果，产出恒为 375 × 内容高（2x 时 750px 宽）。

## Remotion 滚动动画与 MP4

- 组合注册在 [`src/remotion/Root.tsx`](src/remotion/Root.tsx)：`MomentsScroll`，375×812 @30fps，`calculateMetadata` 动态算时长 `max(150, round((feedHeight-812)/140*30) + 60)`。
- 无头渲染不执行 `src/main.tsx`，所以入口 [`src/remotion/index.ts`](src/remotion/index.ts) 会 `setAssetBase('/public/')`——Remotion 的 dev server 把 `public/` 挂在 `/public/` 下，与 Vite 挂在根路径不同；`demoProps()` 也会先 `loadDefault()` 再 `buildSeedDraft()`，否则视频里只有空动态。
- 浏览器里的 `<Player>` 用**实测** feed 高度（`feedRef.offsetHeight`）决定时长；CLI 只能用估算 `estimateFeedHeight = max(812, 88 + 条数*190)`。
- 动画本体是一个 `translateY` 匀速插值，滚动组件与编辑器共用同一套 `StatusBar / NavHeader / MomentsFeed`。

```bash
npx remotion render MomentsScroll out/moment-scroll.mp4
npx remotion studio
```

> CLI 渲染的是 `buildSeedDraft()` 的草稿（`default.json` 自带 12 条就用它们，否则现随机生成），**不是**你正在浏览器里编辑的那份。要给当前草稿出长图，请用顶栏「导出 PNG」。

## 目录结构

`src/` 共 27 个 TS/TSX 文件、约 3000 行。

```
docs/预设JSON导入说明.md      # 字段说明 + 图片编号 + 校验规则 + AI 生成提示词
public/
├── data/default.json         # 唯一的内置数据（281 昵称 / 70 正文 / 42 评论 / 12 动态）
├── preset-images/            # 110 张图片素材（001/010/013/017 为 png，其余 jpg）
├── favicon.svg  icons.svg
src/
├── App.tsx                   # 外壳布局：顶栏、分段切换、三栏 ↔ 单栏、ScaledCanvas 缩放
├── main.tsx                  # 启动：清理旧版草稿 key → loadDefault → seedIfEmpty → 挂载
├── index.css                 # Corporate Clean 类 + 窄屏 / 触屏 media query
├── components/               # 手机内 UI，全部内联样式（WeUI）
│   ├── PhoneFrame.tsx        # 375 宽白底圆角画布，forwardRef 给导出用
│   ├── PhoneChrome.tsx       # 状态栏（时间 / 图标四种排布 / 信号 / WiFi / 电池）+ 导航栏
│   ├── MomentHeader.tsx      # 可选顶部封面 + 我的名字与头像
│   ├── MomentsFeed.tsx       # feed 容器，forwardRef 供量高
│   ├── MomentItem.tsx        # 头像 / 昵称 / 正文折叠 / 位置 / 时间 / ⋯ / 分割线
│   ├── LikesCommentsBlock.tsx# 点赞 + 评论 + 中间细线
│   └── media/MediaRenderer.tsx # 单图四档 / 宫格 / 视频号 / 链接 / 广告
├── panels/                   # 外壳面板（Tailwind）
│   ├── ControlPanel.tsx      # 全局设置 + 动态列表
│   ├── GlobalForm.tsx        # 主题 / 时间 / 电池 / 信号 / 图标与位置 / 封面 / 倍率
│   ├── MomentListPanel.tsx   # 新增 6 种类型、折叠列表、上移下移复制删除
│   ├── MomentEditor.tsx      # 单条动态完整编辑器
│   └── PresetLibrary.tsx     # 导入 / 导出 / 恢复内置 + 四个分组 + 缩略图网格
├── store/                    # useDraftStore（persist）/ usePresetStore（parsePreset 校验在这）
├── data/                     # presets.ts 随机生成与 JSON→草稿映射 / statusIcons.ts 16 种内置图标
├── remotion/                 # MomentsScroll 组合 / Root 注册 / index 无头入口
├── types/moment.ts           # MediaType / Orientation / Comment / Moment / Draft
└── utils/                    # assets.ts(photo:N 与 assetBase) theme.ts(WeUI token) exportPng.ts
                              # randomize.ts(pickOne/pickUnique/fileToDataUrl) timeLabels.ts(23 个时间标签)
vite.config.ts  remotion.config.ts  tailwind.config.js  postcss.config.js
tsconfig{,.app,.node}.json  .oxlintrc.json  .gitignore  LICENSE
```

## 开发、检查与验证

```bash
npx tsc --noEmit -p tsconfig.app.json   # 只做类型检查（npm run build 已包含）
npm run build                            # 产出 dist/
npm run preview                          # 本地起 dist/
npx oxlint -c .oxlintrc.json             # 仓库只带配置、没装依赖，用 npx 临时跑
```

改完至少走这三步：类型检查 + 构建通过；`npm run preview` 里点一遍「一键生成 → 展开一条动态改字段 → 切深色 → 开封面 → 导出 PNG」；需要出片时再跑一次 CLI 渲染。响应式改动建议用 320 / 360 / 390 / 768 / 1280 几档宽度量一次 `documentElement.scrollWidth`，确认没有横向溢出。

## 已知限制与坑

- **后台标签页里「导出 PNG」会卡住**：`html-to-image` 内部等 `requestAnimationFrame`，而页面不可见时 rAF 不触发。前台正常；自动化脚本里要先把 rAF 换成 `setTimeout` 版。
- **后台标签页里 Remotion `<Player>` 不初始化 canvas**，是同一类问题（rAF 驱动），不是集成 bug。
- 深色 / 浅色主题只作用于**手机画布内部**，外壳始终是 Corporate Clean 浅色。
- 上传的图片以 dataURL 存在 localStorage 里，几十张就可能撑爆 5 MB 配额；批量作图请改用 `photo:N` 引用。
- 12 条以上长 feed 的 3x 导出会生成很高的 canvas，低端设备可能失败；降到 2x 即可。
- `out/`、`dist/`、`.微信朋友圈模拟器.qoder.site`（Qoder Sites 的本地发布恢复状态）都在 `.gitignore` 里。

## 部署到任意静态托管

`dist/` 是纯静态产物，没有路由、没有后端，任何托管都行；注意：

1. 资源引用都相对站点根，子路径部署需要配 Vite `base`。
2. 单页应用，未做 history fallback；直接访问 `/` 即可，站内没有深层路径。
3. `vite.config.ts` 用 `terser` 且关掉标识符重命名（`mangle: false`），**不要随手删掉**：esbuild 压缩后的短变量名会拼出形如 `pt-…` / `jt-…` 的串，被 Qoder Sites 的产物安全扫描当成令牌而拒绝上传。改回 esbuild 压缩会导致上线失败。

## 隐私说明（发布前必读）

内置昵称池（281 个）、正文 / 评论模板与 12 条内置动态**全部为虚构内容**，集中在 `public/data/default.json`，不含任何真实用户信息。上传的图片、填写的昵称只保存在本机浏览器 localStorage，不会上传到任何服务器。

发布 / 分享前请勿把个人真实数据写进 `public/data/default.json`；若导入了含真实数据的 JSON，请重新点「恢复内置」再导出。

> 本仓库的 `dist/`、`out/` 与上级目录里的方案文档、旧内置数据备份都没有（也不应该）进版本库；曾把仓库内所有源文件与真实好友昵称名单逐条比对，`default.json` 命中数为 0。

> **图片素材版权提示**：`public/preset-images/` 的 110 张图收集自知乎公开专栏《好看的微信头像大全300张》（多为网络转载、原作者不明），仅作演示素材。正式商业发布前建议替换为自有或明确 CC 授权图片。

## 逼真度自检清单

逗号分隔点赞 · 空心心形 · 白色 feed 底色 · 头像圆角 3px · 英文冒号 `: ` · 「回复」灰色 · 单图四档（2 格长边 / 3 栏全景 / 2 栏长图）· 九宫格 2 张两列、4 张 2×2、其余三列（格 95.67px / 间距 4px）· 长正文 6 行折叠出蓝色「全文」· 广告 16:9 + 查看详情 + 广告角标 · 视频号黑底白圈播放键 · 链接卡图标 + 两行截断 · 导航 `#EDEDED` · 正文 17px / 次级 14px / 时间 12px · 0.5px 分割线 · 状态栏时间 + 图标 + 5G + WiFi + 电池齐全 · 定位 `📍` 蓝字行。

---

License：[MIT](LICENSE) © 2026 mjkyleo（内置图片素材版权归各自原作者，见上文提示）。

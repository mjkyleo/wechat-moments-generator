# 预设 JSON 导入说明

给「微信朋友圈模拟器」准备数据用的格式文档。你可以手写，也可以把文末的**提示词**直接丢给 AI，让它生成一份可导入的 JSON。

导入后应用会做什么：

- `nicknames` / `textTemplates` / `commentTemplates` → 喂给「一键生成」「重新随机生成」，随机动态从这里取词
- `moments` → 预设库面板出现「用导入的 N 条动态覆盖当前草稿」按钮，点一下就把这批动态铺进手机预览，可导出 PNG / Remotion 视频
- 图片一律用**编号**引用，不需要在 JSON 里塞 URL 或 base64

---

## 1. 导入方式

| 方式 | 操作 | 说明 |
| --- | --- | --- |
| 临时导入 | 左侧预设库 →「导入 JSON」→ 选本地 `.json` | 立即生效，刷新页面后回到内置数据 |
| 改内置默认 | 覆盖 `public/data/default.json` | 启动时自动加载；`npm run build` 会一起打包 |

面板里「导出 JSON」导出的就是当前内存中的这份结构，可以直接改完再导回来。

## 2. 顶层字段

```jsonc
{
  "version": 1,                          // 可选，缺省按 1
  "nicknames": ["张三", "李四"],          // 必填，非空字符串数组
  "textTemplates": { "美食": ["..."] },   // 必填，对象：分类名 -> 字符串数组
  "commentTemplates": { "起哄": ["999"] },// 必填，同上
  "defaultStatusIcons": ["bell"],         // 可选，缺省 ["bell","smartphone","camera"]
  "moments": []                           // 可选，缺省 []；内置 `public/data/default.json` 带 12 条，启动即直接铺进预览
}
```

- 空字符串会被自动丢掉，`nicknames: ["  ", "阿伟"]` 等价于 `["阿伟"]`。
- 分类名（`textTemplates` / `commentTemplates` 的键）随你起，界面上就按这个显示，例如「美食」「情感」「调侃」。
- `textTemplates` 里的 `视频号` 与 `链接` 两个分类有语义：生成视频号/链接卡片类型动态时优先从这里取文案，其余分类进入普通正文池。
- `defaultStatusIcons` 只影响手机状态栏小图标，可用键：`bell` `smartphone` `camera` `alarm` `clock` `music` `headphones` `watch` `gamepad` `bluetooth` `location` `navigation` `heart` `sun` `moon` `wifi`；此外也接受 `http...` / `data:...` 形式的自定义图标 URL，其他字符串会被忽略（不渲染）。

### 校验规则与报错文案

导入失败时面板会原样显示下面这句 `导入失败：xxx`，照着改就行。

| 情况 | 报错 |
| --- | --- |
| 根节点不是对象 | `JSON 根节点必须是对象` |
| `nicknames` 缺失或不是数组 | `缺少字段: nicknames (数组)` |
| `nicknames` 全是空串 | `字段 nicknames 不能为空数组` |
| `textTemplates` / `commentTemplates` 缺失、为 null 或是数组 | `缺少字段: textTemplates (对象，键为分类名)` |
| 某个分类的值不是数组 | `字段 textTemplates.美食 必须是字符串数组` |
| 一个分类都没有 | `字段 textTemplates 至少要有一个分类` |
| `moments` 不是数组 | `字段 moments 必须是数组` |
| 单条动态不是对象 | `moments[0] 必须是对象` |
| 缺 `authorName` 或为空 | `moments[0].authorName 不能为空` |
| `text` 不是字符串（纯文字动态也要写 `"text": ""`） | `moments[0].text 必须是字符串` |
| `images` / `likes` 不是字符串数组 | `字段 moments[0].images 必须是字符串数组` |
| 评论缺 `author` 或 `content` | `moments[0].comments[1] 需要 author 和 content` |

## 3. `moments`：一条朋友圈

```jsonc
{
  "authorName": "拾壹",        // 必填：昵称
  "text": "这本书啃完三分之一了", // 必填：正文，可为 ""
  "mediaType": "grid",         // 可选，见下表；写错会自动降级
  "images": ["photo:12", "photo:31"], // 图片引用，见第 4 节
  "authorAvatar": "photo:7",   // 可选：头像，同样支持编号；不写则按昵称生成色块头像
  "orientation": "landscape",  // 可选，只影响单图版式：landscape 常规横版 / portrait 竖版 / panorama 全景横图 / tall 长图
  "videoChannelTitle": "深夜电台", // 可选：视频号卡片标题
  "videoCover": "photo:34",    // 可选：视频号封面；不写则自动取 images[0]，都没有就是纯黑底
  "linkTitle": "这篇写得挺实在",   // 可选：链接卡片标题
  "adTag": false,              // 可选：右上角「广告 ∨」标记
  "location": "街角·咖啡馆",     // 可选：定位
  "timeLabel": "25分钟前",      // 可选：不写则随机
  "likes": ["阿伟", "森屿"],     // 可选：点赞昵称列表
  "comments": [                // 可选
    { "author": "屿鹿", "content": "好书！" },
    { "author": "拾壹", "replyTo": "屿鹿", "content": "哈哈" } // replyTo 可选
  ]
}
```

`mediaType` 取值与图片上限：

| 值 | 界面显示 | 生效图片数 |
| --- | --- | --- |
| `text` | 纯文字 | 0 |
| `single-image` | 单图 | 1（受 `orientation` 影响版式） |
| `grid` | 九宫格 | 最多 9 |
| `video-channel` | 视频号 | 1（封面：优先 `videoCover`，缺省用 `images[0]`） |
| `link` | 链接卡片 | 1（缩略图） |
| `ad` | 广告 | 1 |

`mediaType` 写了非法值时：有 `images` 就按 `single-image`，没有就按 `text`。

## 4. 图片怎么写：`photo:N`

素材库共 **110 张**真实风格图片，位于 `public/preset-images/`，头像和配图通用。JSON 里只写编号：

```
photo:1   -> /preset-images/001.png
photo:12  -> /preset-images/012.jpg
photo:110 -> /preset-images/110.jpg
```

- 编号从 **1** 开始，与文件名严格 1:1（三位补零）。
- `001` `010` `013` `017` 这四张是 `.png`，其余都是 `.jpg`——你不用管扩展名，应用自己映射。
- 超出范围会按 110 取模回绕：`photo:111` 等同 `photo:1`，`photo:0` 等同 `photo:110`。
- 想用自己的图：直接写 `https://...` 链接或 `data:image/...` 也行；应用内「上传」按钮转出来的就是 dataURL。
- 旧的 `local:xxx` 占位图引用已废弃，会被当成无效图片，请改成 `photo:N`。

在界面上：预设库「图片素材」分组点开有 110 个缩略图，点一下就复制对应的 `photo:N`，粘到编辑器的图片输入框即可。

## 5. 完整示例

```json
{
  "version": 1,
  "nicknames": ["拾壹", "阿伟", "森屿", "屿鹿", "深夜电台", "白桃乌龙"],
  "textTemplates": {
    "美食": ["这家开了好多年，味道居然一点没变"],
    "阅读": ["这本书啃完三分之一了"],
    "纯emoji": ["☕️"]
  },
  "commentTemplates": {
    "日常": ["？", "666"],
    "真诚": ["真好"]
  },
  "defaultStatusIcons": ["bell", "camera"],
  "moments": [
    {
      "authorName": "拾壹",
      "text": "这本书啃完三分之一了",
      "mediaType": "grid",
      "images": ["photo:12", "photo:31", "photo:44"],
      "timeLabel": "25分钟前",
      "likes": ["森屿", "屿鹿"],
      "comments": [{ "author": "屿鹿", "content": "求书名" }]
    },
    {
      "authorName": "阿伟",
      "text": "☕️",
      "mediaType": "single-image",
      "images": ["photo:88"],
      "orientation": "portrait",
      "location": "街角·咖啡馆",
      "timeLabel": "1小时前",
      "likes": [],
      "comments": []
    }
  ]
}
```

## 6. 丢给 AI 的提示词

> 复制下面整段，把「主题」换成你想要的场景（例：大学生日常 / 一线城市打工人 / 健身房打卡）即可。

```
请生成一份可以直接被「微信朋友圈模拟器」导入的 JSON，只输出 JSON，不要解释文字。

结构要求（严格遵守，字段名不可改）：
{
  "version": 1,
  "nicknames": string[],              // 20-60 个昵称，中文为主，可混少量英文
  "textTemplates": {分类名: string[]}, // 6-10 个分类，每个 5-10 条正文，口语化、像真人发的
  "commentTemplates": {分类名: string[]}, // 4-6 个分类，每个 4-8 条短评论
  "defaultStatusIcons": string[],      // 从 bell/smartphone/camera/alarm/clock/music/headphones/watch/gamepad/bluetooth/location/navigation/heart/sun/moon/wifi 里选 2-3 个
  "moments": Moment[]                  // 8-12 条动态
}

Moment 的字段：
{
  "authorName": string,     // 必须出现在 nicknames 里
  "text": string,           // 正文，纯文字动态也要有内容
  "mediaType": "text" | "single-image" | "grid" | "video-channel" | "link" | "ad",
  "images": string[],       // 见下面图片规则；text 类型给空数组，video-channel 用第 1 张当封面（也可单独写 videoCover）
  "authorAvatar": string,   // 可选，建议统一用 "photo:N"
  "orientation": "landscape" | "portrait" | "panorama" | "tall", // 可选，只给 single-image 用：横版/竖版/全景横图/长图
  "videoChannelTitle": string, // 可选，mediaType=video-channel 时给
  "videoCover": string,        // 可选，mediaType=video-channel 的封面，用 "photo:N"
  "linkTitle": string,         // 可选，mediaType=link 或 ad 时给
  "adTag": boolean,            // 可选，mediaType=ad 时为 true
  "location": string,          // 可选，最多 2 条动态带定位
  "timeLabel": string,         // 从这些里选：刚刚 / 1分钟前 / 5分钟前 / 10分钟前 / 25分钟前 / 38分钟前 / 59分钟前 / 1小时前 / 2小时前 / 3小时前 / 5小时前 / 7小时前 / 9小时前 / 11小时前 / 昨天 08:15 / 昨天 12:30 / 昨天 18:42 / 昨天 20:30 / 昨天 23:11 / 2天前 / 3天前 / 5天前 / 一周前
  "likes": string[],        // 0-12 个，来自 nicknames，不含作者本人，不能重复
  "comments": [{ "author": string, "content": string, "replyTo"?: string }] // 0-4 条；replyTo 只能填本条动态里已出现的作者名
}

图片规则：只能用 "photo:N"，N 为 1-110 的整数（对应素材库里的第 N 张图，头像/配图通用）。九宫格 3-9 张，单图/链接/广告 1 张，且同一条动态内编号不要重复。不要写 URL 或 base64。

内容要求：
1. 全部必须虚构，不能出现真实人名、真实店名、真实地点、真实品牌、真实事件、真实联系方式或任何平台账号。
2. 正文像真人发的朋友圈：短、口语、带一点情绪，可以少量用 emoji；不要每条都同一个句式，不要写成广告文案。
3. 主题：<在这里写你的主题，例如「新疆某大学学生的日常朋友圈」>
4. 动态类型分布：纯文字约 20%、单图约 30%、九宫格约 25%、视频号约 10%、链接约 10%、广告 0-1 条。
5. 时间标签从早到晚混排，越靠前的动态越新。
6. 昵称、正文之间不要互相引用真实公众人物。

输出前自检：JSON 可被 JSON.parse 解析；comments 里的 author、likes 里的人名都在 nicknames 中；所有 images 都是 "photo:N" 且 1<=N<=110。
```

## 7. 常见问题

- **导入后动态没变？** 模板只影响「一键生成」。带 `moments` 时要点预设库里的「用导入的 N 条动态覆盖当前草稿」。
- **图片显示不出来**：检查编号是不是 `photo:` 前缀 + 纯数字（1–110）。旧 `local:` 引用已废弃。
- **想固定一份数据当默认**：把文件改名成 `public/data/default.json` 再构建，启动时会自动加载并直接铺进预览。
- **隐私**：仓库是公开发布的，内置数据全部为虚构生成；导入自己数据时也别把真实好友的名字放进去。

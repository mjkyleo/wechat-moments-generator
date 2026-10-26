import type { Draft } from '../types/moment';

export interface ThemeTokens {
  /** BG-0 页面底色（深色即朋友圈列表底色） */
  page: string;
  /** 导航栏底色 */
  nav: string;
  navText: string;
  /** FG-0 一级内容 */
  text: string;
  /** LINK 链接蓝（昵称/蓝色文字链） */
  name: string;
  /** FG-2 注释灰（时间、占位提示） */
  time: string;
  icon: string;
  /** FG-1 辅助文字 */
  fg1: string;
  /** FG-3 分割线（配合 scaleY(.5) 当 0.5px 细线用） */
  fg3: string;
  /** BG-1 内容块底色（点赞评论块） */
  block: string;
  /** BG-2 次级底色（图标占位块） */
  bg2: string;
  /** 深色下图片的描边，避免黑图融进黑底 */
  imageBorder?: string;
  /** RED 警示红 */
  red: string;
}

// 颜色取自 WeUI 官方 token（weui.wxss）+ 微信设计指南 FG/BG 层级：
// 浅色 BG-0 #EDEDED / BG-1 #F7F7F7 / FG-0 rgba(0,0,0,.9) / LINK #576B95 / BRAND #07C160
// 深色 BG-0 #111111 / FG-0 rgba(255,255,255,.85) / LINK #7D90A9
const light: ThemeTokens = {
  page: '#FFFFFF',
  nav: '#EDEDED',
  navText: '#191919',
  text: '#191919',
  name: '#576B95',
  time: 'rgba(0,0,0,0.3)',
  icon: 'rgba(0,0,0,0.3)',
  fg1: 'rgba(0,0,0,0.55)',
  fg3: 'rgba(0,0,0,0.1)',
  block: '#F7F7F7',
  bg2: '#F2F2F2',
  red: '#FA5151',
};

const dark: ThemeTokens = {
  page: '#111111',
  nav: '#1F1F1F',
  navText: 'rgba(255,255,255,0.85)',
  text: 'rgba(255,255,255,0.85)',
  name: '#7D90A9',
  time: 'rgba(255,255,255,0.3)',
  icon: 'rgba(255,255,255,0.3)',
  fg1: 'rgba(255,255,255,0.5)',
  fg3: 'rgba(255,255,255,0.1)',
  block: '#1F1F1F',
  bg2: '#2C2C2C',
  imageBorder: 'rgba(255,255,255,0.12)',
  red: '#F45151',
};

export const themeOf = (theme: Draft['theme']): ThemeTokens =>
  theme === 'dark' ? dark : light;

/**
 * 朋友圈动态卡片的布局常量（375 宽，值取自微信设计规范收集 §1.6 / §2.2 / §2.3）。
 * 内容栏宽 = 375 - 左右内边距 - 头像 - 头像与文本间距 = 295，宫格按三列等分。
 */
export const LAYOUT = {
  cardPaddingX: 15,
  avatarSize: 40,
  avatarGap: 10,
  gridGap: 4,
  /** 正文行高：weui cell 17px → 24px */
  bodyLineHeight: 1.41176471,
} as const;

export const CONTENT_WIDTH =
  375 - LAYOUT.cardPaddingX * 2 - LAYOUT.avatarSize - LAYOUT.avatarGap;

/** 宫格单格边长（三列等分，列间 4px） */
export const GRID_CELL = (CONTENT_WIDTH - LAYOUT.gridGap * 2) / 3;

/** 0.5px 细线：1px 高度 + scaleY(.5)，WeUI 官方分割线做法 */
export const hairline = (color: string) => ({
  height: 1,
  background: color,
  transform: 'scaleY(0.5)',
  transformOrigin: '0 0' as const,
});

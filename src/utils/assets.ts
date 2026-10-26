const svgUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const AVATAR_COLORS = [
  '#C6B99A', '#F2D7D5', '#B5D8CC', '#AFC8E4', '#D9C2E0',
  '#F5CBA7', '#A9C6A7', '#E6A8B8', '#9BB0C9', '#D5C7B3',
];

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export function avatarFor(name: string): string {
  const h = hashStr(name || '微信');
  const color = AVATAR_COLORS[h % AVATAR_COLORS.length];
  const label = (name || '友').trim().slice(0, 2);
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
      `<rect width="96" height="96" fill="${color}"/>` +
      `<text x="48" y="60" font-size="28" font-family="sans-serif" text-anchor="middle" fill="#5B5347">${label}</text>` +
      `</svg>`,
  );
}

// public/preset-images 下的素材：序号 1..PRESET_IMAGE_COUNT，001/010/013/017 实际是 png
export const PRESET_IMAGE_COUNT = 110;
const PNG_INDEXES = new Set([1, 10, 13, 17]);

export const AVATAR_FILES: string[] = Array.from(
  { length: PRESET_IMAGE_COUNT },
  (_, i) => `${String(i + 1).padStart(3, '0')}.${PNG_INDEXES.has(i + 1) ? 'png' : 'jpg'}`,
);

// Vite 把 public/ 挂在站点根路径，Remotion 无头 bundle 挂在 /public/ 下
let assetBase = '/';
export const setAssetBase = (base: string) => {
  assetBase = base;
};
export const getAssetBase = () => assetBase;
export const assetUrl = (rel: string) => `${assetBase}${rel}`;

// photo:N 与文件名严格 1:1（photo:21 → 021.jpg），越界按序号取模回绕
export const avatarFile = (n: number): string => {
  const len = AVATAR_FILES.length;
  const i = (((n - 1) % len) + len) % len;
  return assetUrl(`preset-images/${AVATAR_FILES[i]}`);
};

export const randomAvatarFile = (): string =>
  avatarFile(1 + Math.floor(Math.random() * AVATAR_FILES.length));

// 图片引用只有两种：photo:N（素材库序号）与直接的 URL / dataURL
export const imageFor = (src: string): string => {
  if (!src.startsWith('photo:')) return src;
  const n = parseInt(src.slice(6), 10);
  return Number.isFinite(n) ? avatarFile(n) : '';
};

export const COVER = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="560" viewBox="0 0 750 560">` +
    `<defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#2B3A55"/><stop offset="0.55" stop-color="#4E6A8A"/><stop offset="1" stop-color="#8FB6C9"/>` +
    `</linearGradient></defs>` +
    `<rect width="750" height="560" fill="url(#c)"/>` +
    `<circle cx="600" cy="150" r="70" fill="#F6E7C8" opacity="0.9"/>` +
    `<text x="80" y="470" font-size="44" font-family="sans-serif" fill="#FFFFFF" opacity="0.85">向生活致敬</text>` +
    `</svg>`,
);

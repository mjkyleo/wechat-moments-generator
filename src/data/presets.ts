import type { Draft, MediaType, Moment, Orientation } from '../types/moment';
import { usePresetStore } from '../store/usePresetStore';
import type { PresetMoment } from '../store/usePresetStore';
import {
  avatarFor,
  COVER,
  imageFor,
  PRESET_IMAGE_COUNT,
  randomAvatarFile,
} from '../utils/assets';
import { pickOne, pickUnique, uid } from '../utils/randomize';
import { randomTimeLabel } from '../utils/timeLabels';

const pool = () => {
  const n = usePresetStore.getState().preset.nicknames;
  return n.length ? n : ['好友'];
};

const allTexts = () => {
  const { textTemplates } = usePresetStore.getState().preset;
  const texts = Object.entries(textTemplates)
    .filter(([k]) => k !== '视频号' && k !== '链接')
    .flatMap(([, arr]) => arr);
  return texts.length ? texts : [''];
};

const allComments = () => {
  const { commentTemplates } = usePresetStore.getState().preset;
  const list = Object.values(commentTemplates).flat();
  return list.length ? list : ['666'];
};

export const emptyMoment = (): Moment => {
  const name = pickOne(pool());
  return {
    id: uid(),
    authorName: name,
    authorAvatar: avatarFor(name),
    text: '',
    mediaType: 'text',
    images: [],
    orientation: 'landscape',
    videoChannelTitle: '古小麦',
    linkTitle: '',
    adTag: false,
    timeLabel: randomTimeLabel(),
    likes: [],
    comments: [],
  };
};

export const emptyDraft = (): Draft => ({
  coverImage: COVER,
  myName: '朋友圈本人',
  myAvatar: avatarFor('我'),
  showCover: false,
  theme: 'light',
  statusBarTime: '20:03',
  battery: 57,
  signalType: '5G',
  statusIcons: usePresetStore.getState().preset.defaultStatusIcons,
  statusIconsAlign: 'right',
  exportScale: 2,
  moments: [],
});

// 纯随机草稿：顶栏「重新随机生成」用；内置数据自带动态时启动走 buildSeedDraft
export const buildRandomDraft = (): Draft => ({
  ...emptyDraft(),
  moments: generateMoments(4 + Math.floor(Math.random() * 3)),
});

// 首次打开 / 无头渲染的初始草稿：优先用默认数据里预置的那批动态，没带则回落到随机生成
export const buildSeedDraft = (): Draft => {
  const { moments } = usePresetStore.getState().preset;
  if (moments.length) return { ...emptyDraft(), moments: moments.map(fromPresetMoment) };
  return buildRandomDraft();
};

const MEDIA_WEIGHTS: [MediaType, number][] = [
  ['text', 1.5],
  ['single-image', 3],
  ['grid', 2.5],
  ['video-channel', 1],
  ['link', 0.5],
];

const pickMediaType = (): MediaType => {
  const total = MEDIA_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [type, w] of MEDIA_WEIGHTS) {
    r -= w;
    if (r <= 0) return type;
  }
  return 'single-image';
};

// 从素材库随机取 n 张互不重复的图片引用
export const pickPhotoRefs = (n: number, exclude: string[] = []): string[] =>
  pickUnique(
    Array.from({ length: PRESET_IMAGE_COUNT }, (_, i) => `photo:${i + 1}`),
    n,
    exclude,
  );

export const ORIENTATIONS: Orientation[] = ['landscape', 'portrait', 'panorama', 'tall'];

// 单图版式按规范 §2.3 的四个宽高比档位，常规横版占多数
const pickOrientation = (): Orientation => {
  const r = Math.random();
  if (r < 0.5) return 'landscape';
  if (r < 0.8) return 'portrait';
  return r < 0.9 ? 'panorama' : 'tall';
};

export function generateMoments(count: number, excludeNames: string[] = []): Moment[] {
  const { textTemplates } = usePresetStore.getState().preset;
  const authors = pickUnique(pool(), count, excludeNames);
  return authors.map((name, i) => {
    const mediaType = pickMediaType();
    const likeCount = 2 + Math.floor(Math.random() * 10);
    const commentCount = Math.random() < 0.65 ? 1 + Math.floor(Math.random() * 3) : 0;
    const likers = pickUnique(
      pool().filter((n) => n !== name),
      likeCount,
    );
    const commenters = pickUnique(
      pool().filter((n) => n !== name && !likers.slice(0, 3).includes(n)),
      commentCount,
    );
    const videoTexts = textTemplates['视频号'] ?? [];
    const linkTexts = textTemplates['链接'] ?? [];
    const mediaTexts =
      mediaType === 'video-channel' && videoTexts.length
        ? videoTexts
        : mediaType === 'link' && linkTexts.length
          ? linkTexts
          : null;
    return emptyMomentBase({
      authorName: name,
      authorAvatar: randomAvatarFile(),
      text: pickOne(mediaTexts ?? allTexts()),
      mediaType,
      images:
        mediaType === 'single-image' || mediaType === 'ad'
          ? pickPhotoRefs(1)
          : mediaType === 'grid'
            ? pickPhotoRefs(3 + (i % 6))
            : [],
      orientation: pickOrientation(),
      linkTitle: mediaType === 'link' ? pickOne(linkTexts.length ? linkTexts : allTexts()) : undefined,
      videoChannelTitle: pickOne(pool()),
      timeLabel: randomTimeLabel(),
      likes: likers,
      comments: commenters.map((c, j) => ({
        id: uid(),
        author: c,
        replyTo: j > 0 && Math.random() < 0.4 ? commenters[0] : undefined,
        content: pickOne(allComments()),
      })),
    });
  });
}

const emptyMomentBase = (patch: Partial<Moment>): Moment => ({
  ...emptyMoment(),
  ...patch,
});

const MEDIA_TYPE_VALUES: MediaType[] = [
  'text',
  'single-image',
  'grid',
  'video-channel',
  'link',
  'ad',
];

// 导入 JSON 里的动态 -> 草稿动态：补齐 id、头像，photo:N 引用原样保留由渲染层解析
export const fromPresetMoment = (p: PresetMoment): Moment => {
  const mediaType = MEDIA_TYPE_VALUES.includes(p.mediaType as MediaType)
    ? (p.mediaType as MediaType)
    : p.images?.length
      ? 'single-image'
      : 'text';
  return {
    ...emptyMoment(),
    authorName: p.authorName,
    authorAvatar: p.authorAvatar
      ? imageFor(p.authorAvatar)
      : avatarFor(p.authorName),
    text: p.text,
    mediaType,
    images: p.images ?? [],
    orientation: ORIENTATIONS.includes(p.orientation as Orientation)
      ? (p.orientation as Orientation)
      : 'landscape',
    videoChannelTitle: p.videoChannelTitle ?? emptyMoment().videoChannelTitle,
    videoCover: p.videoCover ?? (mediaType === 'video-channel' ? p.images?.[0] : undefined),
    linkTitle: p.linkTitle ?? '',
    adTag: p.adTag ?? mediaType === 'ad',
    location: p.location,
    timeLabel: p.timeLabel ?? randomTimeLabel(),
    likes: p.likes ?? [],
    comments: (p.comments ?? []).map((c) => ({
      id: uid(),
      author: c.author,
      replyTo: c.replyTo,
      content: c.content,
    })),
  };
};

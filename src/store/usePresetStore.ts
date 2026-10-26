import { create } from 'zustand';
import { getAssetBase, setAssetBase } from '../utils/assets';

export type TemplateMap = Record<string, string[]>;

export interface PresetComment {
  author: string;
  replyTo?: string;
  content: string;
}

/** 导入 JSON 里的单条动态：不含 id/头像，载入草稿时补齐 */
export interface PresetMoment {
  authorName: string;
  authorAvatar?: string;
  text: string;
  mediaType?: string;
  images?: string[];
  orientation?: string;
  videoChannelTitle?: string;
  videoCover?: string;
  linkTitle?: string;
  adTag?: boolean;
  location?: string;
  timeLabel?: string;
  likes?: string[];
  comments?: PresetComment[];
}

export interface PresetJSON {
  version: number;
  nicknames: string[];
  textTemplates: TemplateMap;
  commentTemplates: TemplateMap;
  defaultStatusIcons: string[];
  moments: PresetMoment[];
}

export const EMPTY_PRESET: PresetJSON = {
  version: 1,
  nicknames: [],
  textTemplates: {},
  commentTemplates: {},
  defaultStatusIcons: ['bell', 'smartphone', 'camera'],
  moments: [],
};

const requireStringArray = (v: unknown, field: string): string[] => {
  if (!Array.isArray(v)) throw new Error(`缺少字段: ${field} (数组)`);
  const list = v.map(String).filter((s) => s.trim() !== '');
  if (!list.length) throw new Error(`字段 ${field} 不能为空数组`);
  return list;
};

const parseTemplateMap = (v: unknown, field: string): TemplateMap => {
  if (typeof v !== 'object' || v === null || Array.isArray(v))
    throw new Error(`缺少字段: ${field} (对象，键为分类名)`);
  const out: TemplateMap = {};
  for (const [group, list] of Object.entries(v as Record<string, unknown>)) {
    if (!Array.isArray(list))
      throw new Error(`字段 ${field}.${group} 必须是字符串数组`);
    out[group] = list.map(String).filter((s) => s.trim() !== '');
  }
  if (!Object.keys(out).length) throw new Error(`字段 ${field} 至少要有一个分类`);
  return out;
};

const optionalStringArray = (v: unknown, field: string): string[] | undefined => {
  if (v === undefined) return undefined;
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string'))
    throw new Error(`字段 ${field} 必须是字符串数组`);
  return v;
};

const parseMoments = (v: unknown): PresetMoment[] => {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error('字段 moments 必须是数组');
  return v.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null)
      throw new Error(`moments[${i}] 必须是对象`);
    const m = raw as Partial<PresetMoment>;
    if (typeof m.authorName !== 'string' || !m.authorName.trim())
      throw new Error(`moments[${i}].authorName 不能为空`);
    if (typeof m.text !== 'string') throw new Error(`moments[${i}].text 必须是字符串`);
    const comments = Array.isArray(m.comments)
      ? m.comments.map((c, j) => {
          if (typeof c !== 'object' || c === null)
            throw new Error(`moments[${i}].comments[${j}] 必须是对象`);
          const cc = c as Partial<PresetComment>;
          if (typeof cc.author !== 'string' || typeof cc.content !== 'string')
            throw new Error(`moments[${i}].comments[${j}] 需要 author 和 content`);
          return {
            author: cc.author,
            ...(typeof cc.replyTo === 'string' ? { replyTo: cc.replyTo } : {}),
            content: cc.content,
          };
        })
      : [];
    return {
      authorName: m.authorName,
      text: m.text,
      ...(typeof m.authorAvatar === 'string' ? { authorAvatar: m.authorAvatar } : {}),
      ...(m.mediaType !== undefined ? { mediaType: String(m.mediaType) } : {}),
      images: optionalStringArray(m.images, `moments[${i}].images`) ?? [],
      ...(typeof m.orientation === 'string' ? { orientation: m.orientation } : {}),
      ...(typeof m.videoChannelTitle === 'string' ? { videoChannelTitle: m.videoChannelTitle } : {}),
      ...(typeof m.videoCover === 'string' ? { videoCover: m.videoCover } : {}),
      ...(typeof m.linkTitle === 'string' ? { linkTitle: m.linkTitle } : {}),
      ...(typeof m.adTag === 'boolean' ? { adTag: m.adTag } : {}),
      ...(typeof m.location === 'string' ? { location: m.location } : {}),
      ...(typeof m.timeLabel === 'string' ? { timeLabel: m.timeLabel } : {}),
      likes: optionalStringArray(m.likes, `moments[${i}].likes`) ?? [],
      comments,
    };
  });
};

export const parsePreset = (raw: unknown): PresetJSON => {
  if (typeof raw !== 'object' || raw === null)
    throw new Error('JSON 根节点必须是对象');
  const o = raw as Partial<PresetJSON>;
  return {
    version: typeof o.version === 'number' ? o.version : 1,
    nicknames: requireStringArray(o.nicknames, 'nicknames'),
    textTemplates: parseTemplateMap(o.textTemplates, 'textTemplates'),
    commentTemplates: parseTemplateMap(o.commentTemplates, 'commentTemplates'),
    defaultStatusIcons: Array.isArray(o.defaultStatusIcons)
      ? o.defaultStatusIcons.map(String)
      : EMPTY_PRESET.defaultStatusIcons,
    moments: parseMoments(o.moments),
  };
};

interface PresetStore {
  preset: PresetJSON;
  source: 'default' | 'file' | 'imported' | 'none';
  error: string | null;
  loadDefault: () => Promise<void>;
  importFromText: (text: string) => void;
  exportToFile: () => void;
}

export const usePresetStore = create<PresetStore>((set, get) => ({
  preset: EMPTY_PRESET,
  source: 'none',
  error: null,

  loadDefault: async () => {
    // Vite 下 data/default.json 在 /data/default.json，Remotion 无头 bundle 在 /public/data/default.json
    // 先试当前 assetBase（Remotion 入口会预设成 /public/），再回落到另一个
    const known = ['/', '/public/'];
    const candidates = [getAssetBase(), ...known.filter((b) => b !== getAssetBase())];
    for (const base of candidates) {
      try {
        const res = await fetch(`${base}data/default.json`, { cache: 'no-cache' });
        if (!res.ok) continue;
        setAssetBase(base);
        set({
          preset: parsePreset(await res.json()),
          source: 'default',
          error: null,
        });
        return;
      } catch {
        // 换下一个候选路径
      }
    }
    set({ error: '加载 public/data/default.json 失败：/data/default.json 与 /public/data/default.json 均不可用' });
  },

  importFromText: (text) => {
    try {
      set({ preset: parsePreset(JSON.parse(text)), source: 'imported', error: null });
    } catch (e) {
      set({ error: '导入失败：' + (e as Error).message });
    }
  },

  exportToFile: () => {
    const blob = new Blob([JSON.stringify(get().preset, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moments-default.json';
    a.click();
    URL.revokeObjectURL(url);
  },
}));

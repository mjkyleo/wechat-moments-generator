import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
} from 'lucide-react';
import type { MediaType } from '../types/moment';
import { useDraftStore } from '../store/useDraftStore';
import { MomentEditor } from './MomentEditor';

const NEW_TYPES: { value: MediaType; label: string }[] = [
  { value: 'text', label: '纯文字' },
  { value: 'single-image', label: '单图' },
  { value: 'grid', label: '九宫格' },
  { value: 'video-channel', label: '视频号' },
  { value: 'link', label: '链接' },
  { value: 'ad', label: '广告' },
];

export function MomentListPanel() {
  const moments = useDraftStore((s) => s.draft.moments);
  const { addMoment, deleteMoment, duplicateMoment, moveMoment } =
    useDraftStore();
  const [openId, setOpenId] = useState<string | null>(moments[0]?.id ?? null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {NEW_TYPES.map((t) => (
          <button
            key={t.value}
            className="btn text-[11px]"
            onClick={() => setOpenId(addMoment({ mediaType: t.value }))}
          >
            <Plus size={11} className="inline -mt-0.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {moments.map((m, i) => (
          <div
            key={m.id}
            className={`rounded-xl overflow-hidden card !p-0 ${
              m.id === openId ? 'card-selected' : ''
            }`}
          >
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                onClick={() => setOpenId(m.id === openId ? null : m.id)}
              >
                {m.id === openId ? (
                  <ChevronDown size={14} className="shrink-0" />
                ) : (
                  <ChevronRight size={14} className="shrink-0" />
                )}
                <img
                  src={m.authorAvatar}
                  alt=""
                  className="w-6 h-6 rounded-[2px] object-cover shrink-0"
                />
                <span className="text-[13px] font-medium truncate">
                  {m.authorName}
                </span>
                <span className="text-[11px] text-gray-400 truncate flex-1">
                  {m.text}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {NEW_TYPES.find((t) => t.value === m.mediaType)?.label ?? m.mediaType}
                </span>
              </button>
              <div className="flex items-center shrink-0">
                <button className="btn !p-1" disabled={i === 0} onClick={() => moveMoment(m.id, -1)}>
                  <ArrowUp size={11} />
                </button>
                <button
                  className="btn !p-1"
                  disabled={i === moments.length - 1}
                  onClick={() => moveMoment(m.id, 1)}
                >
                  <ArrowDown size={11} />
                </button>
                <button className="btn !p-1" onClick={() => duplicateMoment(m.id)}>
                  <Copy size={11} />
                </button>
                <button
                  className="btn !p-1 text-red-500"
                  onClick={() => deleteMoment(m.id)}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            {m.id === openId && (
              <div className="px-3 pb-3">
                <MomentEditor moment={m} />
              </div>
            )}
          </div>
        ))}
        {!moments.length && (
          <p className="text-xs text-gray-400 py-4 text-center">
            还没有动态，用上方按钮添加，或点顶栏「一键生成」
          </p>
        )}
      </div>
    </div>
  );
}

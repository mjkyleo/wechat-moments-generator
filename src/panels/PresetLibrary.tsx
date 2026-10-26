import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  Layers,
  Upload,
} from 'lucide-react';
import { usePresetStore } from '../store/usePresetStore';
import { useDraftStore } from '../store/useDraftStore';
import { fromPresetMoment } from '../data/presets';
import { AVATAR_FILES } from '../utils/assets';

function Section({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card !p-0 overflow-hidden">
      <button
        className="section-header"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="flex-1 text-left">{title}</span>
        {count !== undefined && (
          <span className="text-gray-400 font-normal">{count}</span>
        )}
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

export function PresetLibrary() {
  const preset = usePresetStore((s) => s.preset);
  const source = usePresetStore((s) => s.source);
  const error = usePresetStore((s) => s.error);
  const importFromText = usePresetStore((s) => s.importFromText);
  const exportToFile = usePresetStore((s) => s.exportToFile);
  const loadDefault = usePresetStore((s) => s.loadDefault);

  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadMoments = useDraftStore((s) => s.loadMoments);
  const fileRef = useRef<HTMLInputElement>(null);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(text);
    window.setTimeout(() => setCopied(null), 1200);
  };

  const applyImportedMoments = () => {
    loadMoments(preset.moments.map(fromPresetMoment));
    setNotice(`已载入 ${preset.moments.length} 条动态，可在中间预览区查看`);
    window.setTimeout(() => setNotice(null), 2000);
  };

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importFromText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-3 text-[12px]">
      {copied && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 text-xs px-4 py-2 neu-toast">
          已复制「{copied.slice(0, 24)}」，粘贴到右侧输入框
        </div>
      )}

      {notice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 text-xs px-4 py-2 neu-toast">
          {notice}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button className="btn flex-1" onClick={() => fileRef.current?.click()}>
          <Upload size={12} className="inline -mt-0.5" /> 导入 JSON
        </button>
        <button className="btn flex-1" onClick={exportToFile}>
          <Download size={12} className="inline -mt-0.5" /> 导出 JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            onPickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {preset.moments.length > 0 && (
        <button className="btn btn-primary w-full" onClick={applyImportedMoments}>
          <Layers size={12} className="inline -mt-0.5" /> 用导入的 {preset.moments.length} 条动态覆盖当前草稿
        </button>
      )}
      <p className="text-gray-400 leading-relaxed">
        JSON 字段与图片编号写法见 <code>docs/预设JSON导入说明.md</code>；配图用 <code>photo:N</code>（1–{AVATAR_FILES.length}）指向下方素材。
      </p>
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>
          数据源：
          {source === 'default'
            ? '内置 data/default.json'
            : source === 'imported'
              ? '已导入的文件'
              : source === 'file'
                ? '本地文件'
                : '未加载'}
        </span>
        <button className="link-btn" onClick={() => void loadDefault()}>
          恢复内置
        </button>
      </div>
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 leading-relaxed">
          {error}
        </p>
      )}

      <Section title="昵称池" count={preset.nicknames.length} defaultOpen>
        <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
          {preset.nicknames.map((n) => (
            <button key={n} className="chip" onClick={() => copy(n)}>
              {n}
            </button>
          ))}
          {preset.nicknames.length === 0 && (
            <p className="text-gray-400">导入的 JSON 中没有昵称</p>
          )}
        </div>
      </Section>

      <Section
        title="正文模板"
        count={Object.values(preset.textTemplates).reduce((a, b) => a + b.length, 0)}
      >
        {Object.entries(preset.textTemplates).map(([cat, arr]) => (
          <div key={cat} className="mb-2 last:mb-0">
            <div className="text-gray-400 mb-1">{cat}</div>
            <div className="space-y-1">
              {arr.map((t) => (
                <button
                  key={t}
                  className="block w-full text-left chip !whitespace-normal truncate"
                  title={t}
                  onClick={() => copy(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="评论模板"
        count={Object.values(preset.commentTemplates).reduce((a, b) => a + b.length, 0)}
      >
        {Object.entries(preset.commentTemplates).map(([cat, arr]) => (
          <div key={cat} className="mb-2 last:mb-0">
            <div className="text-gray-400 mb-1">{cat}</div>
            <div className="flex flex-wrap gap-1">
              {arr.map((t) => (
                <button key={t} className="chip" onClick={() => copy(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="图片素材（头像/配图通用）" count={AVATAR_FILES.length}>
        <div className="grid grid-cols-6 gap-1.5 max-h-64 overflow-y-auto pr-1">
          {AVATAR_FILES.map((f, idx) => (
            <span key={f} className="relative group">
              <button
                className="block w-full rounded overflow-hidden card !p-0 aspect-square"
                title={`复制到正文：photo:${idx + 1}（素材编号 ${f}）`}
                onClick={() => copy(`photo:${idx + 1}`)}
              >
                <img
                  src={`/preset-images/${f}`}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
              <a
                href={`/preset-images/${f}`}
                download={f}
                className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/55 text-white rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title={`下载 ${f}`}
              >
                存
              </a>
            </span>
          ))}
        </div>
        <p className="text-gray-400 mt-2 leading-relaxed">
          点图片即复制 <code>photo:N</code> 引用（N 为素材序号 1–{AVATAR_FILES.length}），粘贴到动态「图片」里可作头像或配图；编辑器「随机配图」与「换头像」按钮从本素材库随机取图，悬停缩略图右下角可下载原图。
        </p>
      </Section>
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { useDraftStore } from '../store/useDraftStore';
import { TIME_LABELS } from '../utils/timeLabels';
import { BUILTIN_STATUS_ICONS } from '../data/statusIcons';
import { fileToDataUrl } from '../utils/randomize';

export function GlobalForm() {
  const draft = useDraftStore((s) => s.draft);
  const setGlobal = useDraftStore((s) => s.setGlobal);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  const icons = draft.statusIcons ?? [];

  const toggleIcon = (key: string) =>
    setGlobal({
      statusIcons: icons.includes(key)
        ? icons.filter((k) => k !== key)
        : [...icons, key],
    });

  const addCustomIcons = async (files: FileList | null) => {
    if (!files?.length) return;
    const entries = await Promise.all(
      Array.from(files).map(async (f) => ({ url: await fileToDataUrl(f), name: f.name })),
    );
    setGlobal({
      statusIcons: [
        ...icons,
        ...entries.map((e) => e.url).filter((u) => !icons.includes(u)),
      ],
    });
    setCustomNames((prev) => {
      const next = { ...prev };
      entries.forEach((e) => (next[e.url] = e.name));
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label !mb-0">主题</span>
        <div className="flex gap-1">
          {(['light', 'dark'] as const).map((th) => (
            <button
              key={th}
              className={`btn ${draft.theme === th ? 'btn-selected' : ''}`}
              onClick={() => setGlobal({ theme: th })}
            >
              {th === 'light' ? '浅色' : '深色'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label">状态栏时间</span>
        <input
          className="field"
          value={draft.statusBarTime}
          onChange={(e) => setGlobal({ statusBarTime: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="label">电池 %</span>
          <input
            className="field"
            type="number"
            min={1}
            max={100}
            value={draft.battery}
            onChange={(e) => setGlobal({ battery: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <span className="label">信号</span>
          <select
            className="field"
            value={draft.signalType}
            onChange={(e) =>
              setGlobal({ signalType: e.target.value as '5G' | '4G' })
            }
          >
            <option value="5G">5G</option>
            <option value="4G">4G</option>
          </select>
        </div>
      </div>

      <div>
        <span className="label">状态栏图标（点击开关，按点击顺序排列）</span>
        <div className="flex flex-wrap gap-1">
          {BUILTIN_STATUS_ICONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`btn !px-2 ${icons.includes(key) ? 'btn-selected' : ''}`}
              title={label}
              onClick={() => toggleIcon(key)}
            >
              <Icon size={13} className="inline -mt-0.5" />
            </button>
          ))}
          {icons
            .filter((k) => !BUILTIN_STATUS_ICONS.some((b) => b.key === k))
            .map((url, i) => (
              <span
                key={url.slice(-24) + i}
              className="relative inline-flex items-center justify-center w-8 h-7 rounded-lg card !p-0"
                title={customNames[url] ?? '自定义图标'}
              >
                <img src={url} alt="" className="w-4 h-4 object-contain" />
                <button
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-700 text-white rounded-full flex items-center justify-center"
                  onClick={() =>
                    setGlobal({ statusIcons: icons.filter((k) => k !== url) })
                  }
                >
                  <X size={8} />
                </button>
              </span>
            ))}
          <label className="btn cursor-pointer">
            + 上传图标
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addCustomIcons(e.target.files)}
            />
          </label>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          建议透明底小图（PNG/SVG），显示位置由上方「状态栏图标位置」决定。
        </p>
      </div>

      <div>
        <span className="label">状态栏图标位置</span>
        <div className="flex gap-1">
          {(
            [
              ['timeLeft', '时间左侧'],
              ['left', '靠左'],
              ['center', '居中'],
              ['right', '靠右'],
            ] as const
          ).map(([v, lab]) => (
            <button
              key={v}
              className={`btn flex-1 !px-1 ${
                (draft.statusIconsAlign ?? 'right') === v ? 'btn-selected' : ''
              }`}
              onClick={() => setGlobal({ statusIconsAlign: v })}
            >
              {lab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="label !mb-0">显示顶部封面</span>
        <input
          type="checkbox"
          checked={draft.showCover}
          onChange={(e) => setGlobal({ showCover: e.target.checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="label !mb-0">导出倍率</span>
        <div className="flex gap-1">
          {([2, 3] as const).map((n) => (
            <button
              key={n}
              className={`btn ${draft.exportScale === n ? 'btn-selected' : ''}`}
              onClick={() => setGlobal({ exportScale: n })}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        可选时间标签：{TIME_LABELS.slice(0, 6).join(' / ')} …
      </p>
    </div>
  );
}

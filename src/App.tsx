import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Player } from '@remotion/player';
import { Camera, Download, RotateCcw, Video } from 'lucide-react';
import { useDraftStore } from './store/useDraftStore';
import { PhoneFrame } from './components/PhoneFrame';
import { MomentsFeed } from './components/MomentsFeed';
import { StatusBar, NavHeader } from './components/PhoneChrome';
import { MomentsScroll } from './remotion/MomentsScroll';
import { PresetLibrary } from './panels/PresetLibrary';
import { ControlPanel } from './panels/ControlPanel';
import { exportNodeAsPng } from './utils/exportPng';
import { themeOf } from './utils/theme';

type Tab = 'edit' | 'anim';
type MobileView = 'preview' | 'panel' | 'presets';

// 手机画布的设计宽度：屏幕窄于它时等比缩小显示，导出的 PNG 仍是原始尺寸
const PHONE_WIDTH = 375;

// 容器可用宽度 → 缩放比（只缩小、不放大；面板隐藏时宽度为 0，保持上一次的比例）
const useFitScale = (hostRef: RefObject<HTMLElement | null>, natural: number) => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const fit = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(Math.min(1, width / natural));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hostRef, natural]);
  return scale;
};

// 缩放只作用在外层，PhoneFrame 自身不带 transform，html-to-image 导出结果不受影响
function ScaledCanvas({ scale, children }: { scale: number; children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      className="mx-auto overflow-hidden"
      style={{ width: PHONE_WIDTH * scale, height: height * scale || undefined }}
    >
      <div
        ref={innerRef}
        style={{ width: PHONE_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const draft = useDraftStore((s) => s.draft);
  const savedAt = useDraftStore((s) => s.savedAt);
  const generate = useDraftStore((s) => s.generate);
  const regenerate = useDraftStore((s) => s.regenerate);
  const clearAll = useDraftStore((s) => s.clearAll);

  const [tab, setTab] = useState<Tab>('edit');
  const [view, setView] = useState<MobileView>('preview');
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(812);
  const frameRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const scale = useFitScale(stageRef, PHONE_WIDTH);

  useLayoutEffect(() => {
    const h = feedRef.current?.offsetHeight ?? 0;
    if (tab === 'edit' && h > 0) setFeedHeight(h);
  }, [draft, tab]);

  const onExport = async () => {
    if (!frameRef.current) return;
    setBusy(true);
    setExportError(null);
    try {
      await exportNodeAsPng(
        frameRef.current,
        draft.exportScale,
        `wechat-moments-${Date.now()}.png`,
        themeOf(draft.theme).page,
      );
    } catch (e) {
      setExportError(e instanceof Error ? e.message : '导出失败');
    } finally {
      setBusy(false);
    }
  };

  const videoDuration = Math.max(
    150,
    Math.round((Math.max(0, feedHeight - 812) / 140) * 30) + 60,
  );

  const previewNode = (
    <div className="mx-auto w-full max-w-[417px]">
      <div className="flex w-full xl:w-[377px] mx-auto mb-3 sm:mb-4 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <button
          className={`tab ${tab === 'edit' ? 'tab-active' : ''}`}
          onClick={() => setTab('edit')}
        >
          即时编辑
        </button>
        <button
          className={`tab ${tab === 'anim' ? 'tab-active' : ''}`}
          onClick={() => setTab('anim')}
        >
          <Video size={12} className="inline -mt-0.5" /> Remotion 滚动动画
        </button>
      </div>

      <div className="preview-stage">
        <div ref={stageRef}>
          {tab === 'edit' ? (
            <ScaledCanvas scale={scale}>
              <PhoneFrame ref={frameRef}>
                <StatusBar draft={draft} />
                <NavHeader draft={draft} />
                <MomentsFeed ref={feedRef} draft={draft} />
              </PhoneFrame>
            </ScaledCanvas>
          ) : (
            <ScaledCanvas scale={scale}>
              <div
                style={{
                  width: PHONE_WIDTH,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#1C1C1E',
                }}
              >
                <Player
                  component={MomentsScroll}
                  inputProps={{ draft, feedHeight }}
                  durationInFrames={videoDuration}
                  fps={30}
                  compositionWidth={375}
                  compositionHeight={812}
                  acknowledgeRemotionLicense
                  controls
                  loop
                  style={{ width: 375, height: 812 }}
                />
              </div>
            </ScaledCanvas>
          )}
        </div>
      </div>

      {tab === 'anim' && (
        <p className="text-[11px] text-gray-500 mt-3 sm:mt-4 leading-relaxed">
          Player 实时预览当前草稿的滚动动画。命令行导出 MP4：
          <code className="rounded-md bg-gray-100 border border-gray-200 px-1.5 !py-0.5 inline-block text-gray-600">
            npx remotion render MomentsScroll out/moment-scroll.mp4
          </code>
          （CLI 渲染 src/remotion/Root.tsx 注册的示例草稿；浏览器端长图请用「即时编辑」标签的导出按钮）
        </p>
      )}
    </div>
  );

  const shown = (key: MobileView) =>
    `${view === key ? 'block' : 'hidden'} xl:block flex-1 min-w-0 min-h-0`;

  const panes: {
    key: MobileView;
    label: string;
    className: string;
    order: string;
    node: ReactNode;
  }[] = [
    {
      key: 'preview',
      label: '手机预览',
      className: `${shown('preview')} overflow-y-auto overflow-x-hidden py-2`,
      order: 'order-1 xl:order-2',
      node: previewNode,
    },
    {
      key: 'panel',
      label: `编辑面板 ${draft.moments.length}`,
      className: `${shown('panel')} xl:flex-none xl:w-[420px] xl:shrink-0 rounded-xl bg-white border border-gray-200 shadow-md overflow-hidden`,
      order: 'order-2 xl:order-3',
      node: <ControlPanel />,
    },
    {
      key: 'presets',
      label: '预设库',
      className: `${shown('presets')} xl:flex-none xl:w-[330px] xl:shrink-0 overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-md p-4`,
      order: 'order-3 xl:order-1',
      node: (
        <>
          <h2 className="text-sm font-bold text-gray-900 mb-3">预设库</h2>
          <PresetLibrary />
        </>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-5 py-2 sm:py-0 sm:h-16 bg-white border-b border-gray-200 shadow-sm">
        <div className="group flex items-center gap-2.5 font-bold text-[15px] text-gray-900 min-w-0">
          <span className="icon-badge">
            <Camera size={17} />
          </span>
          <span className="truncate">微信朋友圈模拟器</span>
        </div>

        <div className="ml-auto sm:ml-4 flex items-center gap-1.5">
          <span className="hidden sm:inline text-xs text-gray-500">一键生成</span>
          <input
            type="number"
            min={1}
            max={20}
            aria-label="一键生成条数"
            className="field !w-14 !py-1 text-center"
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
            }
          />
          <span className="hidden sm:inline text-xs text-gray-500">条</span>
          <button className="btn btn-primary" onClick={() => generate(count)}>
            生成
          </button>
        </div>

        <div className="order-last w-full sm:order-none sm:w-auto sm:ml-auto flex flex-wrap items-center gap-2">
          <span className="hidden sm:inline text-xs text-gray-400">
            {savedAt
              ? `草稿已保存 ${new Date(savedAt).toLocaleTimeString()}`
              : '草稿自动保存'}
          </span>
          <button className="btn" onClick={regenerate}>
            <RotateCcw size={12} className="inline -mt-0.5" /> 重新随机生成
          </button>
          <button className="btn" onClick={clearAll}>
            清空
          </button>
          <button
            className="btn btn-primary ml-auto sm:ml-0"
            disabled={busy || tab !== 'edit'}
            title={tab === 'anim' ? '请先切回「即时编辑」标签' : undefined}
            onClick={onExport}
          >
            <Download size={12} className="inline -mt-0.5" /> 导出 PNG{' '}
            {draft.exportScale}x
          </button>
          {exportError && (
            <span className="order-last w-full sm:w-auto sm:order-none text-xs text-red-500 truncate" title={exportError}>
              导出失败：{exportError}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-200/70 overflow-hidden">
        <nav className="xl:hidden shrink-0 flex gap-1 rounded-xl bg-white border border-gray-200 shadow-md p-1">
          {panes.map((p) => (
            <button
              key={p.key}
              className={`seg ${view === p.key ? 'seg-active' : ''}`}
              onClick={() => setView(p.key)}
            >
              {p.label}
            </button>
          ))}
        </nav>

        {panes.map((p) => (
          <div key={p.key} className={`${p.className} ${p.order}`}>
            {p.node}
          </div>
        ))}
      </div>
    </div>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { usePresetStore } from './store/usePresetStore';
import { useDraftStore } from './store/useDraftStore';

// v3 及更早的草稿里含从真机截图誊来的示例动态，启动时一并清掉
localStorage.removeItem('wechat-moments-draft-v1');
localStorage.removeItem('wechat-moments-draft-v2');
localStorage.removeItem('wechat-moments-draft-v3');

// 预设加载完成后，若本机还没有草稿则灌入内置数据（default.json 自带一批动态，没带则随机生成）
usePresetStore
  .getState()
  .loadDefault()
  .then(() => useDraftStore.getState().seedIfEmpty());

// 仅开发环境：便于在浏览器控制台/自动化里直接驱动两个 store
if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>;
  w.__presetStore = usePresetStore;
  w.__draftStore = useDraftStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

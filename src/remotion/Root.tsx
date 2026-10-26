import { Composition } from 'remotion';
import type { FC } from 'react';
import { buildSeedDraft } from '../data/presets';
import { usePresetStore } from '../store/usePresetStore';
import { MomentsScroll, estimateFeedHeight } from './MomentsScroll';

const HEIGHT = 812;

// Remotion 无头渲染不会跑 main.tsx，需在此先把 public/data/default.json 读进来，
// 否则拿不到昵称/模板，导出视频里只有空动态。
async function demoProps() {
  const store = usePresetStore.getState();
  if (store.source === 'none') await store.loadDefault();
  const draft = buildSeedDraft();
  const feedHeight = estimateFeedHeight(draft);
  const scrollable = Math.max(0, feedHeight - HEIGHT);
  return {
    props: { draft, feedHeight },
    durationInFrames: Math.max(150, Math.round((scrollable / 140) * 30) + 60),
  };
}

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="MomentsScroll"
      component={MomentsScroll}
      durationInFrames={150}
      fps={30}
      width={375}
      height={HEIGHT}
      defaultProps={{ draft: buildSeedDraft(), feedHeight: HEIGHT }}
      calculateMetadata={demoProps}
    />
  );
};

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { FC } from 'react';
import type { Draft } from '../types/moment';
import { StatusBar, NavHeader } from '../components/PhoneChrome';
import { MomentsFeed } from '../components/MomentsFeed';
import { themeOf } from '../utils/theme';

export interface MomentsProps extends Record<string, unknown> {
  draft: Draft;
  feedHeight: number;
}

export const estimateFeedHeight = (draft: Draft) =>
  Math.max(812, 88 + draft.moments.length * 190);

export const MomentsScroll: FC<MomentsProps> = ({
  draft,
  feedHeight,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height } = useVideoConfig();

  const fullHeight = feedHeight > 0 ? feedHeight : estimateFeedHeight(draft);
  const scrollable = Math.max(0, fullHeight - height);
  const top = interpolate(frame, [0, durationInFrames], [0, -scrollable]);

  return (
    <AbsoluteFill style={{ background: themeOf(draft.theme).page }}>
      <AbsoluteFill style={{ width: 375, justifyContent: 'flex-start' }}>
        <div style={{ transform: `translateY(${top}px)` }}>
          <StatusBar draft={draft} />
          <NavHeader draft={draft} />
          <MomentsFeed draft={draft} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

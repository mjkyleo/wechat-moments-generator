import { forwardRef } from 'react';
import type { Draft } from '../types/moment';
import { themeOf } from '../utils/theme';
import { MomentHeader } from './MomentHeader';
import { MomentItem } from './MomentItem';

interface Props {
  draft: Draft;
}

export const MomentsFeed = forwardRef<HTMLDivElement, Props>(
  function MomentsFeed({ draft }, ref) {
    const t = themeOf(draft.theme);
    return (
      <div
        ref={ref}
        style={{
          width: 375,
          background: t.page,
          fontFamily:
            "-apple-system, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
        }}
      >
        <MomentHeader draft={draft} />
        {draft.moments.map((moment, i) => (
          <MomentItem
            key={moment.id}
            moment={moment}
            t={t}
            last={i === draft.moments.length - 1}
          />
        ))}
        {draft.moments.length === 0 && (
          <div
            style={{
              padding: '80px 0',
              textAlign: 'center',
              fontSize: 14,
              color: t.time,
            }}
          >
            暂无动态，点右侧「添加动态」开始
          </div>
        )}
        <div style={{ height: 24, background: t.page }} />
      </div>
    );
  },
);

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { Moment } from '../types/moment';
import type { ThemeTokens } from '../utils/theme';
import { LAYOUT, hairline } from '../utils/theme';
import { avatarFor } from '../utils/assets';
import { MediaRenderer } from './media/MediaRenderer';
import { LikesCommentsBlock } from './LikesCommentsBlock';

const FONT =
  "-apple-system, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif";

/** 真机朋友圈正文超过约 6 行折叠成「全文」；17px 字号在 295 宽栏内约 17 个全角字一行 */
const COLLAPSE_LINES = 6;
const CHARS_PER_LINE = 17;

const estimateLines = (text: string) =>
  text
    .split('\n')
    .reduce((n, seg) => n + Math.max(1, Math.ceil(seg.length / CHARS_PER_LINE)), 0);

export function MomentItem({
  moment,
  t,
  last,
}: {
  moment: Moment;
  t: ThemeTokens;
  last?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const avatar = moment.authorAvatar || avatarFor(moment.authorName);
  const collapsed = !expanded && estimateLines(moment.text) > COLLAPSE_LINES;
  return (
    <div style={{ background: t.page, fontFamily: FONT }}>
      <div
        style={{
          display: 'flex',
          gap: LAYOUT.avatarGap,
          padding: `${LAYOUT.cardPaddingX}px ${LAYOUT.cardPaddingX}px 10px`,
        }}
      >
        <img
          src={avatar}
          alt=""
          style={{
            width: LAYOUT.avatarSize,
            height: LAYOUT.avatarSize,
            borderRadius: 3,
            flexShrink: 0,
            objectFit: 'cover',
            background: t.block,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: t.name }}>
            {moment.authorName}
          </div>

          {moment.text && (
            <div style={{ marginTop: 4, fontSize: 17, color: t.text }}>
              <div
                style={{
                  lineHeight: LAYOUT.bodyLineHeight,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  ...(collapsed
                    ? {
                        display: '-webkit-box',
                        WebkitLineClamp: COLLAPSE_LINES,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }
                    : {}),
                }}
              >
                {moment.text}
              </div>
              {collapsed && (
                <button
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'right',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    fontSize: 17,
                    color: t.name,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(true)}
                >
                  全文
                </button>
              )}
            </div>
          )}

          <MediaRenderer moment={moment} t={t} />

          {moment.location && (
            <div style={{ fontSize: 13, color: t.name, marginTop: 8 }}>
              📍 {moment.location}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 12, color: t.time }}>{moment.timeLabel}</span>
            <MoreHorizontal size={18} color={t.icon} strokeWidth={2.4} />
          </div>

          <LikesCommentsBlock moment={moment} t={t} />
          <div style={{ height: 10 }} />
        </div>
      </div>
      {!last && <div style={hairline(t.fg3)} />}
    </div>
  );
}

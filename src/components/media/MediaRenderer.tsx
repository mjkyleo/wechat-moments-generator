import { Link2, Play } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Moment } from '../../types/moment';
import type { ThemeTokens } from '../../utils/theme';
import { CONTENT_WIDTH, GRID_CELL, LAYOUT } from '../../utils/theme';
import { imageFor } from '../../utils/assets';

interface MediaProps {
  moment: Moment;
  t: ThemeTokens;
}

/** 单图最长边约占 2 格 + 1 间距（规范 §2.3：0.5 ≤ 宽高比 ≤ 2 时限制在 1-4 格内） */
const SINGLE_MAX = GRID_CELL * 2 + LAYOUT.gridGap;

function SingleImage({ moment, t }: MediaProps) {
  const src = imageFor(moment.images[0] ?? '');
  if (!src) return null;
  const style: CSSProperties = {
    borderRadius: 6,
    display: 'block',
    marginTop: 10,
    objectFit: 'cover',
    border: t.imageBorder ? `1px solid ${t.imageBorder}` : 'none',
  };
  switch (moment.orientation) {
    case 'panorama': // 宽高比 > 2：宽最多占 3 栏、高最多 1 栏
      return (
        <img
          src={src}
          alt=""
          style={{ ...style, width: CONTENT_WIDTH, aspectRatio: '3 / 1' }}
        />
      );
    case 'tall': // 宽高比 < 0.5：高最多占 2 栏、宽最小占 2 栏的 1/3
      return (
        <img
          src={src}
          alt=""
          style={{
            ...style,
            width: (GRID_CELL * 2 + LAYOUT.gridGap) / 3,
            height: SINGLE_MAX,
          }}
        />
      );
    case 'portrait':
      return (
        <img src={src} alt="" style={{ ...style, height: SINGLE_MAX }} />
      );
    default:
      return <img src={src} alt="" style={{ ...style, width: SINGLE_MAX }} />;
  }
}

/**
 * 宫格（规范 §2.3）：2 张一行两格、4 张 2×2，其余三列按序填充；
 * 单格边长与间距按内容栏宽三等分，圆角 3px。
 */
function GridImages({ moment }: MediaProps) {
  const imgs = moment.images.slice(0, 9).map(imageFor).filter(Boolean);
  if (!imgs.length) return null;
  const cols = imgs.length === 2 || imgs.length === 4 ? 2 : 3;
  return (
    <div
      style={{
        marginTop: 10,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${GRID_CELL}px)`,
        gap: LAYOUT.gridGap,
      }}
    >
      {imgs.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          style={{
            width: GRID_CELL,
            height: GRID_CELL,
            objectFit: 'cover',
            borderRadius: 3,
            display: 'block',
          }}
        />
      ))}
    </div>
  );
}

function VideoChannelCard({ moment, t }: MediaProps) {
  const cover = moment.videoCover ? imageFor(moment.videoCover) : '';
  return (
    <div style={{ width: SINGLE_MAX, marginTop: 10, fontFamily: 'inherit' }}>
      <div
        style={{
          background: cover ? `#000 url(${cover}) center/cover` : '#000000',
          aspectRatio: '16 / 9',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
          }}
        >
          <Play size={18} color="#FFFFFF" strokeWidth={0} fill="#FFFFFF" style={{ marginLeft: 2 }} />
        </span>
      </div>
      <div style={{ fontSize: 15, color: t.name, marginTop: 6 }}>
        视频号·{moment.videoChannelTitle || '视频号'}
      </div>
    </div>
  );
}

function LinkCard({ moment, t }: MediaProps) {
  if (!moment.linkTitle) return null;
  const thumb = moment.images[0] ? imageFor(moment.images[0]) : '';
  return (
    <div
      style={{
        marginTop: 10,
        maxWidth: CONTENT_WIDTH * 0.82,
        background: t.block,
        borderRadius: 6,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {thumb ? (
        <img src={thumb} alt="" style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }} />
      ) : (
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            background: t.bg2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Link2 size={18} color={t.icon} />
        </span>
      )}
      <span
        style={{
          fontSize: 14,
          color: t.text,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {moment.linkTitle}
      </span>
    </div>
  );
}

/** 广告卡片（朋友圈广告官方规范 §3.3）：外层图 16:9 满栏宽、文案 ≤4 行、查看详情文字链 */
function AdCard({ moment, t }: MediaProps) {
  const src = imageFor(moment.images[0] ?? '');
  return (
    <div style={{ marginTop: 10, position: 'relative' }}>
      {src && (
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            borderRadius: 6,
            display: 'block',
          }}
        />
      )}
      {moment.linkTitle && (
        <div
          style={{
            fontSize: 14,
            color: t.text,
            marginTop: 8,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {moment.linkTitle}
        </div>
      )}
      <div style={{ fontSize: 13, color: t.name, marginTop: 6 }}>查看详情</div>
      {moment.adTag && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            fontSize: 11,
            color: '#FFFFFF',
            background: 'rgba(0,0,0,0.35)',
            borderRadius: 3,
            padding: '1px 5px',
          }}
        >
          广告 ∨
        </span>
      )}
    </div>
  );
}

export function MediaRenderer({ moment, t }: MediaProps) {
  switch (moment.mediaType) {
    case 'single-image':
      return <SingleImage moment={moment} t={t} />;
    case 'grid':
      return <GridImages moment={moment} t={t} />;
    case 'video-channel':
      return <VideoChannelCard moment={moment} t={t} />;
    case 'link':
      return <LinkCard moment={moment} t={t} />;
    case 'ad':
      return <AdCard moment={moment} t={t} />;
    default:
      return null;
  }
}

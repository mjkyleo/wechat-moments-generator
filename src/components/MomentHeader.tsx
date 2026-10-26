import type { Draft } from '../types/moment';
import { themeOf } from '../utils/theme';
import { COVER } from '../utils/assets';

export function MomentHeader({ draft }: { draft: Draft }) {
  if (!draft.showCover) return null;
  const t = themeOf(draft.theme);
  return (
    <div style={{ position: 'relative', background: t.page }}>
      <div
        style={{
          height: 280,
          background: `url("${draft.coverImage || COVER}") center/cover`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 46,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 10,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            fontFamily:
              "-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
          }}
        >
          {draft.myName}
        </span>
        <img
          src={draft.myAvatar}
          alt=""
          style={{
            width: 64,
            height: 64,
            borderRadius: 4,
            border: `3px solid ${t.page}`,
            objectFit: 'cover',
          }}
        />
      </div>
      <div style={{ height: 12 }} />
    </div>
  );
}

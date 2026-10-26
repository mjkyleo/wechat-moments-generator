import { Camera, ChevronLeft } from 'lucide-react';
import type { Draft } from '../types/moment';
import { themeOf } from '../utils/theme';
import { BUILTIN_STATUS_ICONS } from '../data/statusIcons';

const FONT =
  "-apple-system, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif";

function StatusIconItem({ iconKey, color }: { iconKey: string; color: string }) {
  const builtin = BUILTIN_STATUS_ICONS.find((b) => b.key === iconKey);
  if (builtin) {
    return <builtin.Icon size={15} color={color} strokeWidth={2} />;
  }
  if (iconKey.startsWith('data:') || iconKey.startsWith('http')) {
    return (
      <img
        src={iconKey}
        alt=""
        style={{ width: 15, height: 15, objectFit: 'contain', display: 'block' }}
      />
    );
  }
  return null;
}

function Battery({ level, color }: { level: number; color: string }) {
  const pct = Math.max(0, Math.min(100, level));
  const fill = pct <= 20 ? '#FF453A' : color;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color, letterSpacing: 0.2 }}>
        {pct}
      </span>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect
          x="0.7"
          y="0.7"
          width="21.6"
          height="11.6"
          rx="3.2"
          stroke={color}
          strokeOpacity="0.55"
          strokeWidth="1.3"
        />
        <path
          d="M24.4 4.4 v4.2 a2.4 2.4 0 0 0 0 -4.2 Z"
          fill={color}
          fillOpacity="0.55"
        />
        <rect
          x="2.7"
          y="2.7"
          width={Math.max(1.5, (17.6 * pct) / 100)}
          height="7.6"
          rx="1.6"
          fill={fill}
        />
      </svg>
    </span>
  );
}

export function StatusBar({ draft }: { draft: Draft }) {
  const t = themeOf(draft.theme);
  const icons = draft.statusIcons ?? ['bell', 'smartphone', 'camera'];
  const align = draft.statusIconsAlign ?? 'right';

  const iconList = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {icons.map((k, i) => (
        <StatusIconItem key={k + i} iconKey={k} color={t.text} />
      ))}
    </span>
  );

  const timeText = (
    <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>
      {draft.statusBarTime}
    </span>
  );

  return (
    <div
      style={{
        position: 'relative',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontFamily: FONT,
        background: t.page,
      }}
    >
      {align === 'timeLeft' ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {iconList}
          {timeText}
        </span>
      ) : align === 'left' ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {timeText}
          {iconList}
        </span>
      ) : (
        timeText
      )}

      {align === 'center' && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            height: '100%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {iconList}
        </span>
      )}

      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {align === 'right' && iconList}
        <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>
          {draft.signalType}
        </span>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.5 L1 3.8 A10 10 0 0 1 15 3.8 Z"
            stroke={t.text}
            strokeWidth="1.4"
            fill="none"
          />
        </svg>
        <Battery level={draft.battery} color={t.text} />
      </span>
    </div>
  );
}

export function NavHeader({ draft }: { draft: Draft }) {
  const t = themeOf(draft.theme);
  return (
    <div
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: t.nav,
        fontFamily: FONT,
        position: 'relative',
      }}
    >
      <ChevronLeft size={22} color={t.navText} strokeWidth={2.4} />
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 17,
          fontWeight: 600,
          color: t.navText,
          pointerEvents: 'none',
        }}
      >
        朋友圈
      </span>
      <Camera size={21} color={t.navText} strokeWidth={2.2} />
    </div>
  );
}

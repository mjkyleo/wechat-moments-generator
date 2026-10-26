import { Heart } from 'lucide-react';
import type { Moment } from '../types/moment';
import type { ThemeTokens } from '../utils/theme';
import { hairline } from '../utils/theme';

export function LikesCommentsBlock({
  moment,
  t,
}: {
  moment: Moment;
  t: ThemeTokens;
}) {
  const { likes, comments } = moment;
  if (!likes.length && !comments.length) return null;

  return (
    <div
      style={{
        background: t.block,
        borderRadius: 8,
        padding: '8px 12px',
        marginTop: 10,
        fontSize: 14, /* weui 次级字号 */
        lineHeight: 1.5,
      }}
    >
      {likes.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <Heart
            size={14}
            color={t.time}
            strokeWidth={2}
            fill="none"
            style={{ flexShrink: 0, marginTop: 4 }}
          />
          <span style={{ color: t.name, wordBreak: 'break-word' }}>
            {likes.join(', ')}
          </span>
        </div>
      )}

      {likes.length > 0 && comments.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          <div style={hairline(t.fg3)} />
        </div>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{ wordBreak: 'break-word' }}
        >
          <span style={{ color: t.name }}>{c.author}</span>
          {c.replyTo && (
            <>
              <span style={{ color: t.time }}> 回复 </span>
              <span style={{ color: t.name }}>{c.replyTo}</span>
            </>
          )}
          <span style={{ color: t.text }}>: {c.content}</span>
        </div>
      ))}
    </div>
  );
}

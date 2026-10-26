import { useEffect, useState } from 'react';
import { ImagePlus, Trash2, Upload, X } from 'lucide-react';
import type { Comment, MediaType, Moment, Orientation } from '../types/moment';
import { useDraftStore } from '../store/useDraftStore';
import { usePresetStore } from '../store/usePresetStore';
import { imageFor, randomAvatarFile } from '../utils/assets';
import { ORIENTATIONS, pickPhotoRefs } from '../data/presets';
import { fileToDataUrl, pickOne, pickUnique, uid } from '../utils/randomize';
import { TIME_LABELS } from '../utils/timeLabels';

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'text', label: '纯文字' },
  { value: 'single-image', label: '单图' },
  { value: 'grid', label: '九宫格' },
  { value: 'video-channel', label: '视频号' },
  { value: 'link', label: '链接卡片' },
  { value: 'ad', label: '广告' },
];

// 版式档位对应规范 §2.3 的单图宽高比适配规则
const ORIENTATION_LABELS: Record<Orientation, { label: string; hint: string }> = {
  landscape: { label: '常规横版', hint: '0.5 ≤ 宽高比 ≤ 2：最长边约占 2 格 + 间距' },
  portrait: { label: '竖版', hint: '0.5 ≤ 宽高比 ≤ 2：最长边约占 2 格 + 间距' },
  panorama: { label: '全景横图', hint: '宽高比 > 2：宽占 3 栏、高 1 栏' },
  tall: { label: '长图', hint: '宽高比 < 0.5：高占 2 栏、宽约 2/3 格（裁切）' },
};

const imageLimit = (type: MediaType) =>
  type === 'grid' ? 9 : type === 'single-image' || type === 'ad' ? 1 : type === 'link' ? 1 : 0;

export function MomentEditor({ moment }: { moment: Moment }) {
  const update = useDraftStore((s) => s.updateMoment);
  const preset = usePresetStore((s) => s.preset);
  const nicknamePool = preset.nicknames.length ? preset.nicknames : ['好友'];
  const allComments = Object.values(preset.commentTemplates).flat();
  if (allComments.length === 0) allComments.push('666');
  const randomName = () => pickOne(nicknamePool.filter((n) => n !== moment.authorName));
  const patch = (p: Partial<Moment>) => update(moment.id, p);

  const [likesText, setLikesText] = useState(moment.likes.join(', '));
  const [likesDraft, setLikesDraft] = useState(moment.likes.length);
  useEffect(() => {
    setLikesDraft(moment.likes.length);
  }, [moment.likes]);
  useEffect(() => {
    const joined = moment.likes.join(', ');
    if (likesText !== joined && likesText.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean).join(', ') !== joined) {
      setLikesText(joined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment.likes]);

  const setLikesFromText = (text: string) => {
    setLikesText(text);
    patch({ likes: text.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean) });
  };

  const maxImages = imageLimit(moment.mediaType);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    patch({ images: [...moment.images, ...urls].slice(0, Math.max(1, maxImages)) });
  };

  const addPhotos = () => {
    const need = maxImages - moment.images.length;
    if (need <= 0) return;
    patch({ images: [...moment.images, ...pickPhotoRefs(need, moment.images)] });
  };

  return (
    <div className="space-y-3 pt-2">
      {/* 作者 */}
      <div className="flex items-center gap-2 flex-wrap">
        <img
          src={moment.authorAvatar}
          alt=""
          className="w-10 h-10 rounded-[3px] object-cover shrink-0 card !p-0 overflow-hidden"
        />
        <div className="flex-1 min-w-[150px]">
          <span className="label">昵称</span>
          <input
            className="field"
            value={moment.authorName}
            onChange={(e) => patch({ authorName: e.target.value })}
          />
        </div>
        <button
          className="btn"
          title="随机昵称+头像"
          onClick={() => patch({ authorName: pickOne(nicknamePool), authorAvatar: randomAvatarFile() })}
        >
          随机
        </button>
        <button
          className="btn"
          title="随机头像素材"
          onClick={() => patch({ authorAvatar: randomAvatarFile() })}
        >
          换头像
        </button>
        <label className="btn cursor-pointer">
          <Upload size={12} className="inline -mt-0.5" /> 头像
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) patch({ authorAvatar: await fileToDataUrl(f) });
            }}
          />
        </label>
      </div>

      {/* 正文 */}
      <div>
        <span className="label">正文</span>
        <textarea
          className="field min-h-[64px] resize-y"
          value={moment.text}
          placeholder="说点什么…"
          onChange={(e) => patch({ text: e.target.value })}
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(preset.textTemplates).map(([cat, arr]) => (
            <button key={cat} className="chip" onClick={() => patch({ text: pickOne(arr) })}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 媒体 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="label">媒体类型</span>
          <select
            className="field"
            value={moment.mediaType}
            onChange={(e) => {
              const mediaType = e.target.value as MediaType;
              patch({
                mediaType,
                images: moment.images.slice(0, Math.max(1, imageLimit(mediaType))),
                adTag: mediaType === 'ad' ? true : moment.adTag,
              });
            }}
          >
            {MEDIA_TYPES.map((mt) => (
              <option key={mt.value} value={mt.value}>
                {mt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="label">时间标签</span>
          <select
            className="field"
            value={moment.timeLabel}
            onChange={(e) => patch({ timeLabel: e.target.value })}
          >
            {[...new Set([moment.timeLabel, ...TIME_LABELS])].map((tl) => (
              <option key={tl} value={tl}>
                {tl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {maxImages > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
            <span className="label !mb-0">
              图片（{moment.images.length}/{maxImages}）
            </span>
            <div className="flex gap-1">
              <button
                className="btn"
                title="从素材库随机取图（photo:N）"
                onClick={addPhotos}
                disabled={moment.images.length >= maxImages}
              >
                <ImagePlus size={12} className="inline -mt-0.5" /> 随机配图
              </button>
              <label className="btn cursor-pointer">
                <Upload size={12} className="inline -mt-0.5" /> 上传
                <input
                  type="file"
                  accept="image/*"
                  multiple={moment.mediaType === 'grid'}
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {moment.images.map((src, i) => (
              <div key={i} className="relative w-14 h-14">
                <img
                  src={imageFor(src)}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg card !p-0 overflow-hidden"
                />
                <button
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 text-white rounded-full flex items-center justify-center"
                  onClick={() =>
                    patch({ images: moment.images.filter((_, j) => j !== i) })
                  }
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {moment.mediaType === 'single-image' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label !mb-0">版式</span>
          {ORIENTATIONS.map((o) => (
            <button
              key={o}
              className={`btn ${moment.orientation === o ? 'btn-primary' : ''}`}
              title={ORIENTATION_LABELS[o].hint}
              onClick={() => patch({ orientation: o })}
            >
              {ORIENTATION_LABELS[o].label}
            </button>
          ))}
        </div>
      )}

      {moment.mediaType === 'video-channel' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="label">视频号名称</span>
            <input
              className="field"
              value={moment.videoChannelTitle ?? ''}
              onChange={(e) => patch({ videoChannelTitle: e.target.value })}
            />
          </div>
          <div>
            <span className="label">封面（可空，默认黑底）</span>
            <label className="btn cursor-pointer block text-center">
              <Upload size={12} className="inline -mt-0.5" />
              {moment.videoCover ? '已设置，点击更换' : '上传封面'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) patch({ videoCover: await fileToDataUrl(f) });
                }}
              />
            </label>
          </div>
        </div>
      )}

      {(moment.mediaType === 'link' || moment.mediaType === 'ad') && (
        <div>
          <span className="label">{moment.mediaType === 'link' ? '链接标题' : '广告文案'}</span>
          <input
            className="field"
            value={moment.linkTitle ?? ''}
            onChange={(e) => patch({ linkTitle: e.target.value })}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="label !mb-0">右上角「广告 ∨」标签</span>
        <input
          type="checkbox"
          checked={!!moment.adTag}
          onChange={(e) => patch({ adTag: e.target.checked })}
        />
      </div>

      <div>
        <span className="label">位置（可空）</span>
        <input
          className="field"
          value={moment.location ?? ''}
          placeholder="如：街角·咖啡馆"
          onChange={(e) => patch({ location: e.target.value })}
        />
      </div>

      {/* 点赞 */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap gap-y-1">
          <span className="label !mb-0">点赞人数</span>
          <input
            type="number"
            className="field !w-16"
            min={0}
            value={likesDraft}
            onChange={(e) => setLikesDraft(Number(e.target.value) || 0)}
          />
          <button
            className="btn"
            onClick={() =>
              patch({
                likes: pickUnique(
                  nicknamePool.filter((n) => n !== moment.authorName),
                  Math.max(0, likesDraft),
                ),
              })
            }
          >
            抽 {Math.max(0, likesDraft)} 个
          </button>
          <button
            className="btn"
            onClick={() =>
              patch({
                likes: pickUnique(
                  nicknamePool.filter(
                    (n) => n !== moment.authorName && !moment.likes.includes(n),
                  ),
                  moment.likes.length + 3,
                  moment.likes,
                ),
              })
            }
          >
            +3 随机
          </button>
          <button className="btn" onClick={() => patch({ likes: [] })}>
            清空
          </button>
        </div>
        <textarea
          className="field min-h-[40px]"
          value={likesText}
          placeholder="点赞人，逗号分隔"
          onChange={(e) => setLikesFromText(e.target.value)}
        />
      </div>

      {/* 评论 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="label !mb-0">评论（{moment.comments.length}）</span>
          <button
            className="btn"
            onClick={() =>
              patch({
                comments: [
                  ...moment.comments,
                  {
                    id: uid(),
                    author: randomName(),
                    content: pickOne(allComments),
                  },
                ],
              })
            }
          >
            + 随机评论
          </button>
        </div>
        <div className="space-y-2">
          {moment.comments.map((c, i) => (
            <CommentRow
              key={c.id}
              comment={c}
              isFirst={i === 0}
              prevAuthor={i > 0 ? moment.comments[i - 1].author : undefined}
              onChange={(next) =>
                patch({
                  comments: moment.comments.map((x) =>
                    x.id === c.id ? next : x,
                  ),
                })
              }
              onRemove={() =>
                patch({ comments: moment.comments.filter((x) => x.id !== c.id) })
              }
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(preset.commentTemplates).map(([cat, arr]) => (
            <button
              key={cat}
              className="chip"
              onClick={() =>
                patch({
                  comments: [
                    ...moment.comments,
                    {
                      id: uid(),
                      author: randomName(),
                      content: pickOne(arr),
                    },
                  ],
                })
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  prevAuthor,
  onChange,
  onRemove,
}: {
  comment: Comment;
  isFirst: boolean;
  prevAuthor?: string;
  onChange: (c: Comment) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        className="field !w-20 shrink-0"
        value={comment.author}
        placeholder="昵称"
        onChange={(e) => onChange({ ...comment, author: e.target.value })}
      />
      <button
        className={`btn !px-2 ${comment.replyTo ? 'btn-primary' : ''}`}
        title="回复上一条评论的人"
        onClick={() =>
          onChange(
            comment.replyTo
              ? { ...comment, replyTo: undefined }
              : { ...comment, replyTo: prevAuthor },
          )
        }
      >
        回复
      </button>
      <input
        className="field flex-1 min-w-[130px]"
        value={comment.content}
        placeholder="评论内容"
        onChange={(e) => onChange({ ...comment, content: e.target.value })}
      />
      <button className="btn !px-2 !text-red-500" onClick={onRemove}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}

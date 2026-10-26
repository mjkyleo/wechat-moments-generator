export type MediaType =
  | 'text'
  | 'single-image'
  | 'grid'
  | 'video-channel'
  | 'link'
  | 'ad';

/** 单图版式，对应规范 §2.3 的宽高比档位 */
export type Orientation = 'landscape' | 'portrait' | 'panorama' | 'tall';

export interface Comment {
  id: string;
  author: string;
  replyTo?: string;
  content: string;
}

export interface Moment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  mediaType: MediaType;
  images: string[];
  orientation: Orientation;
  videoChannelTitle?: string;
  videoCover?: string;
  linkTitle?: string;
  adTag?: boolean;
  location?: string;
  timeLabel: string;
  likes: string[];
  comments: Comment[];
}

export interface Draft {
  coverImage?: string;
  myName: string;
  myAvatar: string;
  showCover: boolean;

  theme: 'light' | 'dark';
  statusBarTime: string;
  battery: number;
  signalType: '5G' | '4G';
  statusIcons: string[];
  statusIconsAlign: 'timeLeft' | 'left' | 'center' | 'right';
  exportScale: 2 | 3;

  moments: Moment[];
}

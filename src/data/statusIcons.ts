import {
  AlarmClock,
  Bell,
  Bluetooth,
  Camera,
  Clock,
  Gamepad2,
  Headphones,
  Heart,
  MapPin,
  Moon,
  Music,
  Navigation,
  Smartphone,
  Sun,
  Watch,
  Wifi,
} from 'lucide-react';

export interface BuiltinIconDef {
  key: string;
  label: string;
  Icon: typeof Bell;
}

export const BUILTIN_STATUS_ICONS: BuiltinIconDef[] = [
  { key: 'bell', label: '铃铛', Icon: Bell },
  { key: 'smartphone', label: '手机', Icon: Smartphone },
  { key: 'camera', label: '相机', Icon: Camera },
  { key: 'alarm', label: '闹钟', Icon: AlarmClock },
  { key: 'clock', label: '时钟', Icon: Clock },
  { key: 'music', label: '音乐', Icon: Music },
  { key: 'headphones', label: '耳机', Icon: Headphones },
  { key: 'watch', label: '手表', Icon: Watch },
  { key: 'gamepad', label: '游戏', Icon: Gamepad2 },
  { key: 'bluetooth', label: '蓝牙', Icon: Bluetooth },
  { key: 'location', label: '定位', Icon: MapPin },
  { key: 'navigation', label: '导航', Icon: Navigation },
  { key: 'heart', label: '健康', Icon: Heart },
  { key: 'sun', label: '晴天', Icon: Sun },
  { key: 'moon', label: '勿扰', Icon: Moon },
  { key: 'wifi', label: 'WiFi', Icon: Wifi },
];

export const isBuiltinStatusIcon = (key: string) =>
  !key.startsWith('data:') && BUILTIN_STATUS_ICONS.some((b) => b.key === key);

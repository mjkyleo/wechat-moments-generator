import { registerRoot } from 'remotion';
import { setAssetBase } from '../utils/assets';
import { RemotionRoot } from './Root';

// Remotion 的无头服务器把 public/ 挂在 /public/ 下（Vite 挂在根路径）
setAssetBase('/public/');

registerRoot(RemotionRoot);

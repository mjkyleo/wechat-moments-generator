import path from 'path';

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Vite 的静态目录是 public/，Remotion 无头渲染需显式指向它，
// 否则 /data/default.json 与 /preset-images/*.jpg 都会 404。
Config.setPublicDir(path.resolve('public'));

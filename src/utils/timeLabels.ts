export const TIME_LABELS = [
  '刚刚',
  '1分钟前', '5分钟前', '10分钟前', '25分钟前', '38分钟前', '59分钟前',
  '1小时前', '2小时前', '3小时前', '5小时前', '7小时前', '9小时前', '11小时前',
  '昨天 08:15', '昨天 12:30', '昨天 18:42', '昨天 20:30', '昨天 23:11',
  '2天前', '3天前', '5天前', '一周前',
];

export const randomTimeLabel = () =>
  TIME_LABELS[Math.floor(Math.random() * TIME_LABELS.length)];

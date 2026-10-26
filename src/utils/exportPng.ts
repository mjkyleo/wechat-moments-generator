import { toPng } from 'html-to-image';

export async function exportNodeAsPng(
  node: HTMLElement,
  scale: number,
  filename: string,
  backgroundColor = '#FFFFFF',
) {
  const dataUrl = await toPng(node, {
    pixelRatio: scale,
    cacheBust: true,
    backgroundColor,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

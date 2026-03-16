const RENDER_SCALE = 2;

/**
 * Converts all SVG `<img>` elements in a document to PNG data URIs.
 * html2canvas often fails to render SVG images, rasterising them
 * to PNG beforehand produces reliable output.
 */
export async function convertSvgImagesToPng(doc: Document): Promise<void> {
  const svgImages = doc.querySelectorAll<HTMLImageElement>(
    'img[src$=".svg"], img[src*=".svg?"]',
  );

  await Promise.all(Array.from(svgImages).map((img) => rasteriseSvgImage(img)));
}

function rasteriseSvgImage(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    const width = (img.naturalWidth || img.width) * RENDER_SCALE;
    const height = (img.naturalHeight || img.height) * RENDER_SCALE;
    if (!width || !height) return resolve();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve();

    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.onload = () => {
      ctx.drawImage(tempImg, 0, 0, width, height);
      img.src = canvas.toDataURL("image/png");
      resolve();
    };
    tempImg.onerror = () => resolve();
    tempImg.src = img.src;
  });
}

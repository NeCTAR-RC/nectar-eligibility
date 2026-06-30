export interface PdfLinkInfo {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
}

const CONTENT_WIDTH_MM = 210;
const CSS_PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;

/**
 * Extract link positions from an html2canvas-cloned document.
 *
 * Derives the px-to-mm scale from the container width. All links are
 * placed on page 1 (single-page PDF).
 */
export function extractPdfLinks(doc: Document): PdfLinkInfo[] {
  const container =
    doc.querySelector<HTMLElement>(".html2pdf__container") ?? doc.body;
  const containerRect = container.getBoundingClientRect();
  const pxToMm = containerRect.width
    ? CONTENT_WIDTH_MM / containerRect.width
    : MM_PER_INCH / CSS_PX_PER_INCH;

  const links: PdfLinkInfo[] = [];

  container.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const href = link.href;
    if (!href || href.startsWith("javascript:") || href.startsWith("data:"))
      return;

    const rects = link.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      links.push({
        page: 1,
        x: (rect.left - containerRect.left) * pxToMm,
        y: (rect.top - containerRect.top) * pxToMm,
        width: rect.width * pxToMm,
        height: rect.height * pxToMm,
        url: href,
      });
    }
  });

  return links;
}

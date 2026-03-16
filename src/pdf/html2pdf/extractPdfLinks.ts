export interface PdfLinkInfo {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
}

const A4_WIDTH_MM = 210;

/** Standard CSS pixels per inch. */
const CSS_PX_PER_INCH = 96;

/** Millimetres per inch. */
const MM_PER_INCH = 25.4;

/**
 * Extract link positions from an html2canvas-cloned document.
 * Derives the px→mm scale from the container width so coordinates
 * stay correct regardless of the html2canvas windowWidth setting.
 */
export function extractPdfLinks(
  doc: Document,
  pageHeightMm: number,
): PdfLinkInfo[] {
  const container =
    doc.querySelector<HTMLElement>(".html2pdf__container") ?? doc.body;
  const containerRect = container.getBoundingClientRect();
  const pxToMm = containerRect.width
    ? A4_WIDTH_MM / containerRect.width
    : MM_PER_INCH / CSS_PX_PER_INCH;

  const links: PdfLinkInfo[] = [];

  container.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const href = link.href;
    if (!href || href.startsWith("javascript:") || href.startsWith("data:")) return;

    const rects = link.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const left = (rect.left - containerRect.left) * pxToMm;
      const top = (rect.top - containerRect.top) * pxToMm;
      const width = rect.width * pxToMm;
      const height = rect.height * pxToMm;

      const page = Math.floor(top / pageHeightMm) + 1;
      const pageTop = top % pageHeightMm;

      links.push({
        page,
        x: left,
        y: pageTop,
        width,
        height,
        url: href,
      });
    }
  });

  return links;
}

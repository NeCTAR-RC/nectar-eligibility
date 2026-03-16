import type { Html2PdfWorker } from "html2pdf.js";
import { convertSvgImagesToPng } from "./convertSvgImagesToPng";
import { extractPdfLinks, type PdfLinkInfo } from "./extractPdfLinks";
import { fixBoxShadowBorders, hideInlineSvgIcons } from "./pdfDomTransforms";
import { FLOW_VERSION } from "../../store/persistence";

const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const CONTAINER_WIDTH_PX = 1200;

/** A4 page height in pixels at the container width. */
const PX_PAGE_HEIGHT = CONTAINER_WIDTH_PX * (A4_HEIGHT_MM / A4_WIDTH_MM);

/** Elements matching this selector are prevented from splitting across pages. */
const AVOID_SPLIT_SELECTOR = "footer[role='contentinfo']";

/**
 * Generate and download a PDF of the current page.
 *
 * html2pdf's built-in pagebreaks plugin is disabled because it measures
 * the live DOM, which has the wrong width on mobile and zoomed viewports.
 * Page-break logic runs instead inside `onclone`, where html2canvas
 * renders into a 1200px-wide iframe with correct media queries.
 *
 * `windowHeight` is capped to one A4 page height so that
 * `parseDocumentSize` uses `body.scrollHeight` (actual content) rather
 * than the inflated `documentElement.clientHeight` from a zoomed-out
 * viewport.
 *
 * @param elementsToHide - DOM elements to temporarily hide during capture
 *   (e.g. buttons to start over or download PDF).
 */
export async function downloadPdf(
  elementsToHide: HTMLElement[],
): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js");

  elementsToHide.forEach((el) => (el.style.display = "none"));

  let collectedLinks: PdfLinkInfo[] = [];

  try {
    const worker: Html2PdfWorker = html2pdf()
      .set({
        margin: 0,
        filename: buildPdfFilename(),
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: CONTAINER_WIDTH_PX,
          windowHeight: Math.round(PX_PAGE_HEIGHT),
          onclone: async (doc: Document) => {
            await prepareCloneForPdf(doc);
            collectedLinks = extractPdfLinks(doc, A4_HEIGHT_MM);
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        enableLinks: false,
      })
      .set({ pagebreak: { mode: [] } })
      .from(document.body)
      .toContainer()
      .then(function (this: Html2PdfWorker) {
        this.prop.container.style.width = CONTAINER_WIDTH_PX + "px";
      })
      .toCanvas()
      .toPdf()
      .get("pdf", (pdf) => {
        collectedLinks.forEach((link) => {
          pdf.setPage(link.page);
          pdf.link(link.x, link.y, link.width, link.height, {
            url: link.url,
          });
        });
        pdf.setPage(pdf.internal.getNumberOfPages());
      });

    await worker.save();
  } finally {
    elementsToHide.forEach((el) => (el.style.display = ""));
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

/** Build a filename like `nectar-eligibility-v1-20260325-1430.pdf`. */
function buildPdfFilename(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  return `nectar-eligibility-v${FLOW_VERSION}-${date}-${time}.pdf`;
}

/**
 * Prepare the html2canvas-cloned document for PDF rendering.
 *
 * Runs inside the 1200px-wide iframe clone where media queries match
 * the PDF layout. Canvas height (`body.scrollHeight`) is measured AFTER
 * `onclone` returns, so DOM changes here (spacers, style overrides) are
 * reflected in the final canvas.
 *
 * Resets `min-height: 100vh` on `#root` because the app uses it to fill
 * the viewport. Inside a tall iframe (e.g. zoomed-out browser), this
 * inflates the flex column layout and pushes the footer far below the
 * content.
 */
async function prepareCloneForPdf(doc: Document): Promise<void> {
  const root = doc.getElementById("root");
  if (root) root.style.minHeight = "auto";

  avoidSplitAcrossPages(doc);
  await convertSvgImagesToPng(doc);
  hideInlineSvgIcons(doc);
  fixBoxShadowBorders(doc);
}

/**
 * Prevent selected elements from being split across PDF pages.
 *
 * If an element would span a page boundary and fits within a single
 * page, a spacer div is inserted before it to push it to the next page.
 */
function avoidSplitAcrossPages(doc: Document): void {
  doc.querySelectorAll<HTMLElement>(AVOID_SPLIT_SELECTOR).forEach((el) => {
    const offsetTop = getDocumentOffsetTop(el, doc.body);
    const elHeight = el.offsetHeight;
    const startPage = Math.floor(offsetTop / PX_PAGE_HEIGHT);
    const endPage = Math.floor((offsetTop + elHeight) / PX_PAGE_HEIGHT);

    if (endPage !== startPage && elHeight <= PX_PAGE_HEIGHT) {
      const spacerHeight = PX_PAGE_HEIGHT - (offsetTop % PX_PAGE_HEIGHT);
      const spacer = doc.createElement("div");
      spacer.style.height = spacerHeight + "px";
      el.parentNode?.insertBefore(spacer, el);
    }
  });
}

/**
 * Calculate an element's top offset relative to a boundary ancestor
 * by walking the offsetParent chain. Unlike `getBoundingClientRect`,
 * this is not affected by scroll position or viewport offset.
 */
function getDocumentOffsetTop(
  el: HTMLElement,
  boundary: HTMLElement,
): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== boundary) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

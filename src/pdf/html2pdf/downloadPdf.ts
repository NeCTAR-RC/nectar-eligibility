import type { Html2PdfWorker } from "html2pdf.js";
import { convertSvgImagesToPng } from "./convertSvgImagesToPng";
import { extractPdfLinks, type PdfLinkInfo } from "./extractPdfLinks";
import { fixBoxShadowBorders, hideInlineSvgIcons } from "./pdfDomTransforms";
import { FLOW_VERSION } from "../../store/persistence";

const CONTENT_WIDTH_MM = 210;
const CONTAINER_WIDTH_PX = 1200;

/**
 * Generate and download a single-page PDF of `<main id="main-content">`.
 *
 * The page width is A4 (210 mm) and the height is derived from the
 * rendered canvas so the entire result fits on one page.
 */
export async function downloadPdf(
  elementsToHide: HTMLElement[],
): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js");

  const sourceElement = document.getElementById("main-content");
  if (!sourceElement) return;

  elementsToHide.forEach((el) => (el.style.display = "none"));

  let collectedLinks: PdfLinkInfo[] = [];
  let contentHeightMm = CONTENT_WIDTH_MM;

  try {
    const worker: Html2PdfWorker = html2pdf()
      .set({
        margin: 0,
        filename: buildPdfFilename(),
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: CONTAINER_WIDTH_PX,
          onclone: async (doc: Document) => {
            await prepareCloneForPdf(doc);
            collectedLinks = extractPdfLinks(doc);
          },
        },
        jsPDF: {
          unit: "mm",
          format: [CONTENT_WIDTH_MM, CONTENT_WIDTH_MM],
          orientation: "portrait",
        },
        enableLinks: false,
      })
      .set({ pagebreak: { mode: [] } })
      .from(sourceElement)
      .toContainer()
      .then(function (this: Html2PdfWorker) {
        this.prop.container.style.width = CONTAINER_WIDTH_PX + "px";
      })
      .toCanvas()
      .then(function (this: Html2PdfWorker) {
        // Derive the page height from the actual rendered canvas so
        // the PDF page exactly fits the content. Both pageSize and
        // opt.jsPDF.format must be patched — pageSize controls the
        // page-split ratio, opt.jsPDF.format controls the jsPDF
        // instance created in toPdf().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prop = this.prop as any;
        const canvas = prop.canvas as HTMLCanvasElement;
        const scale = canvas.width / CONTAINER_WIDTH_PX;
        contentHeightMm =
          (canvas.height / scale) * (CONTENT_WIDTH_MM / CONTAINER_WIDTH_PX);

        const ps = prop.pageSize;
        ps.height = contentHeightMm;
        ps.inner.height = contentHeightMm;
        ps.inner.ratio = contentHeightMm / CONTENT_WIDTH_MM;
        this.opt.jsPDF!.format = [CONTENT_WIDTH_MM, contentHeightMm];
      })
      .toPdf()
      .get("pdf", (pdf) => {
        // Rounding in toPdf can spill an empty sliver onto page 2.
        while (pdf.internal.getNumberOfPages() > 1) {
          pdf.deletePage(pdf.internal.getNumberOfPages());
        }

        collectedLinks.forEach((link) => {
          pdf.setPage(link.page);
          pdf.link(link.x, link.y, link.width, link.height, {
            url: link.url,
          });
        });
      });

    await worker.save();
  } finally {
    elementsToHide.forEach((el) => (el.style.display = ""));
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

function buildPdfFilename(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  return `nectar-eligibility-v${FLOW_VERSION}-${date}-${time}.pdf`;
}

/** Apply DOM fixes to the html2canvas clone before rendering. */
async function prepareCloneForPdf(doc: Document): Promise<void> {
  // Reset min-height: 100vh on #root so the flex layout doesn't
  // inflate the canvas beyond the actual content height.
  const root = doc.getElementById("root");
  if (root) root.style.minHeight = "auto";

  await convertSvgImagesToPng(doc);
  hideInlineSvgIcons(doc);
  fixBoxShadowBorders(doc);
}

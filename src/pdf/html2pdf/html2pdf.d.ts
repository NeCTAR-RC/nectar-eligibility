declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      windowWidth?: number;
      windowHeight?: number;
      onclone?: (doc: Document) => void | Promise<void>;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: "portrait" | "landscape";
    };
    enableLinks?: boolean;
    pagebreak?: { mode?: string[] };
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement): Html2PdfWorker;
    toContainer(): Html2PdfWorker;
    toCanvas(): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    save(): Promise<void>;
    then(callback: (this: Html2PdfWorker) => void): Html2PdfWorker;
    get(type: "pdf", callback: (pdf: JsPdfInstance) => void): Html2PdfWorker;
    prop: {
      container: HTMLElement;
      pdf: JsPdfInstance;
    };
  }

  interface JsPdfInstance {
    setPage(page: number): void;
    link(
      x: number,
      y: number,
      w: number,
      h: number,
      options: { url: string },
    ): void;
    internal: { getNumberOfPages(): number };
  }

  export default function html2pdf(): Html2PdfWorker;
}

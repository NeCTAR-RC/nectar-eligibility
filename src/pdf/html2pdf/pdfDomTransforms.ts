/**
 * DOM transformations applied to the html2pdf clone before rendering.
 * These work around html2canvas quirks and improve PDF output quality.
 */

/** Replace React Aria inset box-shadows with solid borders (html2canvas can't render inset shadows). */
export function fixBoxShadowBorders(doc: Document) {
  doc.querySelectorAll<HTMLElement>("[data-rac]").forEach((el) => {
    const cs = doc.defaultView?.getComputedStyle(el);
    if (!cs?.boxShadow || cs.boxShadow === "none") return;
    if (!cs.boxShadow.includes("inset")) return;

    const colorMatch = cs.boxShadow.match(/rgba?\([^)]+\)/);
    if (colorMatch) {
      el.style.boxShadow = "none";
      el.style.border = `1px solid ${colorMatch[0]}`;
    }
  });
}

/** Hide inline SVG icons inside React Aria interactive elements (html2canvas clips them). */
export function hideInlineSvgIcons(doc: Document) {
  doc
    .querySelectorAll<SVGSVGElement>("a[data-rac] svg, button[data-rac] svg")
    .forEach((svg) => {
      svg.style.display = "none";
    });
}

import { useEffect } from "react";

const BASE_TITLE = "ARDC Nectar Research Cloud Eligibility Assessment";

/** Sets the document title to "pageTitle | base", or the base title alone. */
export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE;
  }, [pageTitle]);
}

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAssessmentStore } from "./assessmentStore";
import { parsePathSegments } from "./flowEngine";
import { generateSessionId, loadFromStorage } from "./persistence";

export function useHydration() {
  const location = useLocation();
  const navigate = useNavigate();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const { sessionId } = parsePathSegments(
      location.pathname,
      location.search,
    );

    if (!sessionId) {
      const newId = generateSessionId();
      navigate(`/?session=${newId}`, { replace: true });
      return;
    }

    // Stale deep link: session param present but no data in localStorage
    const stored = loadFromStorage(sessionId);
    if (!stored && location.pathname !== "/") {
      const newId = generateSessionId();
      useAssessmentStore.getState().setSessionExpired(true);
      navigate(`/?session=${newId}`, { replace: true });
      return;
    }

    useAssessmentStore.getState().initSession(sessionId);
  }, [location.pathname, location.search, navigate]);
}

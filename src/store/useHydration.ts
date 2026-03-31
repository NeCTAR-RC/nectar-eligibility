import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAssessmentStore } from "./assessmentStore";
import { parsePathSegments } from "./flowEngine";
import {
  generateSessionId,
  loadFromStorage,
  purgeExpiredSessions,
} from "./persistence";
import {
  trackSessionRestored,
  trackSessionExpired,
} from "../services/analytics";

export function useHydration() {
  const location = useLocation();
  const navigate = useNavigate();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    purgeExpiredSessions();

    const { sessionId } = parsePathSegments(location.pathname, location.search);

    if (!sessionId) {
      const newId = generateSessionId();
      navigate(`/?session=${newId}`, { replace: true });
      return;
    }

    // Stale deep link: session param present but no data in localStorage
    const stored = loadFromStorage(sessionId);
    if (!stored && location.pathname !== "/") {
      trackSessionExpired(sessionId);
      const newId = generateSessionId();
      useAssessmentStore.getState().setSessionExpired(true);
      navigate(`/?session=${newId}`, { replace: true });
      return;
    }

    // Only fire session_restored when returning via a deep link (steps in the URL path),
    // not on a plain visit to /?session=X which happens during normal navigation.
    if (stored && location.pathname !== "/") {
      trackSessionRestored(sessionId);
    }

    useAssessmentStore.getState().initSession(sessionId);
  }, [location.pathname, location.search, navigate]);
}

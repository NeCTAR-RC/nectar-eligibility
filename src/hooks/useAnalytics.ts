import { initializeAnalytics } from "../services/analytics";

// Initialize GA4 at module load time so it's ready before any component
// effects fire. This avoids a race condition where child useEffects
// (e.g. useHydration) try to send events before the parent's useEffect
// has initialized analytics.
initializeAnalytics();

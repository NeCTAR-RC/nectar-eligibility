import { BrowserRouter, Routes, Route } from "react-router";
import "./hooks/useAnalytics"; // Side-effect: initializes GA4 before any component mounts
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Layout from "./components/Layout/Layout";
import AssessmentPage from "./components/Assessment/AssessmentPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<AssessmentPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/Layout/Layout";
import AssessmentPage from "./components/Assessment/AssessmentPage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<AssessmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import Layout from "@/components/Layout";
import { Loading } from "@/components/shared";

const CaseConsole = lazy(() => import("@/pages/CaseConsole"));
const PillLibrary = lazy(() => import("@/pages/PillLibrary"));
const CaptureInterview = lazy(() => import("@/pages/CaptureInterview"));
const TransferCheck = lazy(() => import("@/pages/TransferCheck"));
const AuditLog = lazy(() => import("@/pages/AuditLog"));

/**
 * Route table. `Layout` renders the shell and an `<Outlet />`; each page is self-contained and
 * fetches exactly what it needs, so a slow or failed request on one screen never blanks another.
 * Pages are lazy-loaded so each route ships its own chunk instead of one monolithic bundle.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<Loading label="Loading case console…" />}>
              <CaseConsole />
            </Suspense>
          }
        />
        <Route
          path="pills"
          element={
            <Suspense fallback={<Loading label="Loading pill library…" />}>
              <PillLibrary />
            </Suspense>
          }
        />
        <Route
          path="capture"
          element={
            <Suspense fallback={<Loading label="Loading capture interview…" />}>
              <CaptureInterview />
            </Suspense>
          }
        />
        <Route
          path="transfer"
          element={
            <Suspense fallback={<Loading label="Loading transfer check…" />}>
              <TransferCheck />
            </Suspense>
          }
        />
        <Route
          path="audit"
          element={
            <Suspense fallback={<Loading label="Loading audit log…" />}>
              <AuditLog />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<Loading label="Loading case console…" />}>
              <CaseConsole />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

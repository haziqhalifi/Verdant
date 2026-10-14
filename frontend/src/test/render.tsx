import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Layout from "@/components/Layout";
import { RoleProvider } from "@/hooks/use-role";

/** Render a page element inside the same providers the app uses. */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { initialPath?: string },
) {
  const { initialPath = "/", ...renderOptions } = options ?? {};
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <RoleProvider>{ui}</RoleProvider>
    </MemoryRouter>,
    renderOptions,
  );
}

/**
 * Render the full app shell: <Layout/> (with its <Outlet/>) wrapping a page
 * at `pagePath`. This tests the nav, role switcher, and layout chrome.
 */
export function renderWithLayout(
  pageElement: ReactElement,
  options?: RenderOptions & { initialPath?: string; pagePath?: string },
) {
  const {
    initialPath = "/",
    pagePath = "/",
    ...renderOptions
  } = options ?? {};
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <RoleProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path={pagePath} element={pageElement} />
          </Route>
        </Routes>
      </RoleProvider>
    </MemoryRouter>,
    renderOptions,
  );
}

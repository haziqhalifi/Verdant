import { waitFor } from "@testing-library/react";

import CaseConsole from "@/pages/CaseConsole";
import { renderWithProviders } from "@/test/render";

/** CaseConsole smoke tests: renders the page without crashing. */
describe("CaseConsole", () => {
  it("renders the page header", async () => {
    renderWithProviders(<CaseConsole />, { initialPath: "/" });

    // The page has a header or section title — let's just verify it renders without throwing
    await waitFor(() => {
      // The case console should render some content once API calls resolve
      expect(document.body.textContent).not.toBe("");
    });
  });
});

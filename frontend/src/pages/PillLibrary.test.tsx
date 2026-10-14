import { screen, waitFor } from "@testing-library/react";

import PillLibrary from "@/pages/PillLibrary";
import { renderWithProviders } from "@/test/render";

/** PillLibrary smoke tests: renders the list, search input, and detail panel. */
describe("PillLibrary", () => {
  it("renders the library with pill summaries after loading", async () => {
    renderWithProviders(<PillLibrary />, { initialPath: "/pills" });

    await waitFor(() => {
      expect(screen.getByText("Chiller Staging Optimisation")).toBeInTheDocument();
    });
  });

  it("renders the search input", async () => {
    renderWithProviders(<PillLibrary />, { initialPath: "/pills" });

    await waitFor(() => {
      expect(screen.getByLabelText("Search pills")).toBeInTheDocument();
    });
  });

  it("renders the status and domain filter dropdowns", async () => {
    renderWithProviders(<PillLibrary />, { initialPath: "/pills" });

    await waitFor(() => {
      expect(screen.getByLabelText("Status filter")).toBeInTheDocument();
      expect(screen.getByLabelText("Domain filter")).toBeInTheDocument();
    });
  });

  it("loads and displays pill detail when a pill is selected", async () => {
    renderWithProviders(<PillLibrary />, { initialPath: "/pills" });

    // The first pill should be auto-selected; its title appears in the detail panel header
    await waitFor(() => {
      // The title appears both in the list and in the detail section header
      const titles = screen.getAllByText("Chiller Staging Optimisation");
      expect(titles.length).toBeGreaterThanOrEqual(2);
    });
  });
});

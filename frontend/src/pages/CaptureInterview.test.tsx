import { waitFor } from "@testing-library/react";

import CaptureInterview from "@/pages/CaptureInterview";
import { renderWithProviders } from "@/test/render";

/** CaptureInterview smoke tests: renders the page without crashing. */
describe("CaptureInterview", () => {
  it("renders the page without crashing", async () => {
    renderWithProviders(<CaptureInterview />, { initialPath: "/capture" });

    await waitFor(() => {
      expect(document.body.textContent).not.toBe("");
    });
  });
});

import { waitFor } from "@testing-library/react";

import TransferCheck from "@/pages/TransferCheck";
import { renderWithProviders } from "@/test/render";

/** TransferCheck smoke tests: renders the page without crashing. */
describe("TransferCheck", () => {
  it("renders the page without crashing", async () => {
    renderWithProviders(<TransferCheck />, { initialPath: "/transfer" });

    await waitFor(() => {
      expect(document.body.textContent).not.toBe("");
    });
  });
});

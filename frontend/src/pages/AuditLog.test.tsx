import { screen, waitFor } from "@testing-library/react";

import AuditLog from "@/pages/AuditLog";
import { renderWithProviders } from "@/test/render";

/** AuditLog smoke tests: renders the page and respects role-based access. */
describe("AuditLog", () => {
  it("renders the page without crashing", async () => {
    renderWithProviders(<AuditLog />, { initialPath: "/audit" });

    await waitFor(() => {
      expect(screen.getByText("Audit log")).toBeInTheDocument();
    });
  });

  it("shows a role-gated message for roles without audit:read (default aom)", async () => {
    renderWithProviders(<AuditLog />, { initialPath: "/audit" });

    // The default role (aom) cannot read the audit log, so the page shows a gating message.
    await waitFor(() => {
      expect(screen.getByText(/cannot read the audit log/)).toBeInTheDocument();
    });
  });
});

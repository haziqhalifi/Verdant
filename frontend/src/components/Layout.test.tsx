import { screen, waitFor } from "@testing-library/react";

import { renderWithLayout } from "@/test/render";

const CHILD = <div>Page content</div>;

/** Layout smoke tests: renders nav, role switcher, and data notice. */
describe("Layout", () => {
  it("renders the VERDANT brand and all nav links", async () => {
    renderWithLayout(CHILD);

    await waitFor(() => {
      expect(screen.getAllByText("VERDANT").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Case console")).toBeInTheDocument();
    expect(screen.getByText("Pill library")).toBeInTheDocument();
    expect(screen.getByText("Capture interview")).toBeInTheDocument();
    expect(screen.getByText("Transfer check")).toBeInTheDocument();
    expect(screen.getByText("Audit log")).toBeInTheDocument();
  });

  it("renders the role switcher with all roles", async () => {
    renderWithLayout(CHILD);

    const select = await screen.findByLabelText("Acting role");
    expect(select).toBeInTheDocument();
    await waitFor(() => {
      const options = select.querySelectorAll("option");
      expect(options.length).toBe(5);
    });
  });

  it("renders the synthetic data notice in the footer", async () => {
    renderWithLayout(CHILD);

    await waitFor(() => {
      expect(screen.getByText(/Synthetic data/)).toBeInTheDocument();
    });
  });

  it("renders the skip-to-main-content link", async () => {
    renderWithLayout(CHILD);

    const skip = screen.getByText("Skip to main content");
    expect(skip).toBeInTheDocument();
    expect(skip.getAttribute("href")).toBe("#main-content");
  });

  it("shows role description after roles load", async () => {
    renderWithLayout(CHILD);

    await waitFor(() => {
      expect(screen.getByText(/Can:/)).toBeInTheDocument();
    });
  });

  it("renders the mobile nav toggle on small screens", async () => {
    renderWithLayout(CHILD);

    const toggle = screen.getByLabelText("Toggle navigation");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("shows a seed status panel after the API responds", async () => {
    renderWithLayout(CHILD);

    await waitFor(() => {
      expect(screen.getByText("Seed")).toBeInTheDocument();
      expect(screen.getByText("Model")).toBeInTheDocument();
    });
  });
});

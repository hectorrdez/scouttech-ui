import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import Tabs, { TabPanel } from "./Tabs.js";

const tabs = [
  { id: "a", label: "Uno" },
  { id: "b", label: "Dos", badge: <span>3</span> },
  { id: "c", label: "Tres" },
];

function Host({ idPrefix }: { idPrefix?: string }) {
  const [active, setActive] = useState("a");
  return (
    <>
      <Tabs tabs={tabs} active={active} onChange={setActive} label="Secciones" idPrefix={idPrefix} />
      <TabPanel id={active} idPrefix={idPrefix}>
        panel {active}
      </TabPanel>
    </>
  );
}

describe("Tabs", () => {
  it("has tablist, tabs with aria-selected and a labelled tabpanel", () => {
    render(<Host />);
    expect(screen.getByRole("tablist", { name: "Secciones" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Dos/ })).toHaveAttribute("aria-selected", "false");
    const panel = screen.getByRole("tabpanel", { name: "Uno" });
    expect(panel).toHaveTextContent("panel a");
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveAttribute("aria-controls", panel.id);
  });

  it("uses roving tabindex", () => {
    render(<Host />);
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: /Dos/ })).toHaveAttribute("tabindex", "-1");
  });

  it("click selects", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("tab", { name: "Tres" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("panel c");
  });

  it("arrows move focus and selection, wrapping; Home/End jump", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Dos/ })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("panel b");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Tres" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Tres" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveFocus();
  });

  it("idPrefix namespaces ids", () => {
    render(<Host idPrefix="x" />);
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveAttribute("id", "x-tab-a");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "x-panel-a");
  });
});

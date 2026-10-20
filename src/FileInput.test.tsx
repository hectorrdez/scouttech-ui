import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileInput } from "./FileInput.js";

describe("FileInput", () => {
  it("labels a file input, with required star", () => {
    render(<FileInput label="Archivo" required />);
    const input = screen.getByLabelText(/Archivo/);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toBeRequired();
  });

  it("hint and error are described and error marks invalid", () => {
    render(<FileInput label="Archivo" hint="PDF" error="Falta" />);
    const input = screen.getByLabelText("Archivo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(screen.getByText("PDF").id);
    expect(screen.getByRole("alert")).toHaveTextContent("Falta");
  });

  it("reports chosen files", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(<FileInput label="Archivo" multiple onFilesChange={onFilesChange} />);
    const a = new File(["a"], "a.txt", { type: "text/plain" });
    const b = new File(["b"], "b.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Archivo"), [a, b]);
    expect(onFilesChange).toHaveBeenCalledWith([a, b]);
  });

  it("can be disabled", () => {
    render(<FileInput label="Archivo" disabled />);
    expect(screen.getByLabelText("Archivo")).toBeDisabled();
  });
});

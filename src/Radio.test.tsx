import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./Radio.js";

describe("Radio / RadioGroup", () => {
  it("renders a radiogroup named by its label, options share a name", () => {
    render(
      <RadioGroup label="Rama" name="rama">
        <Radio label="Lobatos" value="l" />
        <Radio label="Scouts" value="s" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Rama" })).toBeInTheDocument();
    expect(screen.getByLabelText("Lobatos")).toHaveAttribute("name", "rama");
    expect(screen.getByLabelText("Scouts")).toHaveAttribute("name", "rama");
  });

  it("aria-describedby points to hint and error, aria-invalid on error", () => {
    render(
      <RadioGroup id="g" label="Rama" hint="Elige una" error="Falta">
        <Radio label="A" value="a" />
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-describedby", "g-hint g-error");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Falta");
  });

  it("required and disabled propagate to options", () => {
    render(
      <RadioGroup label="Rama" required disabled>
        <Radio label="A" value="a" />
      </RadioGroup>,
    );
    const radio = screen.getByLabelText("A");
    expect(radio).toBeRequired();
    expect(radio).toBeDisabled();
  });

  it("mandatory adds the sr suffix and warning bar without required", () => {
    render(
      <RadioGroup label="Rama" mandatory>
        <Radio label="A" value="a" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: /Rama.*obligatorio/ })).toBeInTheDocument();
    expect(screen.getByLabelText("A")).not.toBeRequired();
  });

  it("selects one option and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup label="Rama">
        <Radio label="A" value="a" onChange={onChange} />
        <Radio label="B" value="b" />
      </RadioGroup>,
    );
    await user.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.click(screen.getByLabelText("B"));
    expect(screen.getByLabelText("A")).not.toBeChecked();
    expect(screen.getByLabelText("B")).toBeChecked();
  });
});

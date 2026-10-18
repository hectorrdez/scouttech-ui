import { describe, expect, it } from "vitest";
import { controlBorderClassName, controlClassName } from "./index.js";

describe("public control class helpers", () => {
  it("are non-empty strings exported from the root barrel", () => {
    for (const className of [controlClassName, controlBorderClassName]) {
      expect(typeof className).toBe("string");
      expect(className.length).toBeGreaterThan(0);
    }
  });

  it("together produce the shared field look (radius and outline)", () => {
    const fieldClasses = `${controlClassName} ${controlBorderClassName}`;
    expect(fieldClasses).toContain("rounded-ui-control");
    expect(fieldClasses).toContain("border-ui-outline");
  });
});

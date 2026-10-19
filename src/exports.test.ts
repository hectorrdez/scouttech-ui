import { describe, expect, it } from "vitest";
import * as field from "./Field.js";
import {
  controlBorderClassName,
  controlClassName,
  controlErrorClassName,
  controlMandatoryClassName,
} from "./index.js";

describe("public control class helpers", () => {
  it("are non-empty strings exported from the root barrel", () => {
    for (const className of [
      controlClassName,
      controlBorderClassName,
      controlErrorClassName,
      controlMandatoryClassName,
    ]) {
      expect(typeof className).toBe("string");
      expect(className.length).toBeGreaterThan(0);
    }
  });

  it("together produce the shared field look (radius and outline)", () => {
    const fieldClasses = `${controlClassName} ${controlBorderClassName}`;
    expect(fieldClasses).toContain("rounded-ui-control");
    expect(fieldClasses).toContain("border-ui-outline");
  });

  it("root barrel and Field subpath expose the same error and mandatory classes", () => {
    expect(controlErrorClassName).toBe(field.controlErrorClassName);
    expect(controlMandatoryClassName).toBe(field.controlMandatoryClassName);
    expect(controlErrorClassName).toContain("border-ui-danger");
    expect(controlMandatoryClassName).toContain("border-l-ui-warning");
  });
});

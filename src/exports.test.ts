import { describe, expect, it } from "vitest";
import * as field from "./Field.js";
import {
  Card,
  CookieConsent,
  AuthBrandHeader,
  ProductMark,
  StatCard,
  cardClassName,
  productNames,
  products,
  controlBorderClassName,
  controlClassName,
  controlErrorClassName,
  controlMandatoryClassName,
  PublicHeader,
  PublicFooter,
  LegalLayout,
  scouttechUrl,
  SCOUTTECH_PATHS,
  Aside,
} from "./index.js";

describe("root barrel exports the cards", () => {
  it("exports Card, StatCard, CookieConsent and cardClassName", () => {
    expect(typeof Card).toBe("function");
    expect(typeof StatCard).toBe("function");
    expect(typeof CookieConsent).toBe("function");
    expect(typeof cardClassName).toBe("function");
  });
});

describe("root barrel exports the product marks", () => {
  it("exports ProductMark, AuthBrandHeader and the product lists", () => {
    expect(typeof ProductMark).toBe("function");
    expect(typeof AuthBrandHeader).toBe("function");
    expect(products).toEqual(["scouttech", "scoutgroup", "scoutlog", "scoutpulse", "scoutconnect"]);
    expect(Object.keys(productNames)).toEqual([...products]);
  });
});

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

describe("root barrel exports the public shell", () => {
  it("exports PublicHeader, PublicFooter, LegalLayout, scouttechUrl and SCOUTTECH_PATHS", () => {
    expect(typeof PublicHeader).toBe("function");
    expect(typeof PublicFooter).toBe("function");
    expect(typeof LegalLayout).toBe("function");
    expect(typeof scouttechUrl).toBe("function");
    expect(SCOUTTECH_PATHS.home).toBe("/");
    expect(SCOUTTECH_PATHS.profile).toBe("/perfil");
    expect(SCOUTTECH_PATHS.apps).toBe("/aplicaciones");
    expect(SCOUTTECH_PATHS.orgLicenses).toBe("/organizacion/licencias");
  });
});

describe("root barrel exports the aside", () => {
  it("exports Aside as a component", () => {
    expect(typeof Aside).toBe("function");
  });
});

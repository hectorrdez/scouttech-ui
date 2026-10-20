import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TBody, TD, TH, THead, TR, Table } from "./Table.js";

function Sample({ selected = false }: { selected?: boolean }) {
  return (
    <Table title="Miembros" meta="2 filas" containerClassName="extra" aria-label="Tabla">
      <THead>
        <TR>
          <TH>Nombre</TH>
        </TR>
      </THead>
      <TBody>
        <TR selected={selected}>
          <TD>Ana</TD>
        </TR>
      </TBody>
    </Table>
  );
}

describe("Table", () => {
  it("renders header, columnheader with scope and cells", () => {
    render(<Sample />);
    expect(screen.getByRole("heading", { name: "Miembros" })).toBeInTheDocument();
    expect(screen.getByText("2 filas")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("cell", { name: "Ana" })).toBeInTheDocument();
  });

  it("applies containerClassName to the card and aria props to the table", () => {
    render(<Sample />);
    expect(screen.getByRole("table", { name: "Tabla" }).closest(".extra")).not.toBeNull();
  });

  it("omits the header without title/meta", () => {
    render(
      <Table>
        <TBody>
          <TR>
            <TD>x</TD>
          </TR>
        </TBody>
      </Table>,
    );
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("marks selected rows with aria-selected", () => {
    render(<Sample selected />);
    expect(screen.getAllByRole("row")[1]).toHaveAttribute("aria-selected", "true");
  });
});

import { Mail, Search, Trash2, Plus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import {
  Button,
  ButtonLink,
  ButtonToogle,
  Input,
  Select,
  ThemeProvider,
  ThemeToggle,
  type ButtonSize,
  type ButtonVariant,
} from "../src/index.js";

const PALETTE_KEY = "scouttech-ui-demo-palette";
const THEME_KEY = "scouttech-ui-demo-theme";
type Palette = "scoutgroup" | "scoutlog";
const palettes: Palette[] = ["scoutgroup", "scoutlog"];

function readInitialPalette(): Palette {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("demo");
    if (fromUrl === "scoutgroup" || fromUrl === "scoutlog") return fromUrl;
    const stored = localStorage.getItem(PALETTE_KEY);
    if (stored === "scoutgroup" || stored === "scoutlog") return stored;
  } catch {
    // Storage blocked: fall back to the default palette.
  }
  return "scoutgroup";
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-ui-outline pt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger"];
const sizes: ButtonSize[] = ["sm", "md"];

function Demo() {
  const [palette, setPalette] = useState<Palette>(readInitialPalette);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.demo = palette;
    try {
      localStorage.setItem(PALETTE_KEY, palette);
    } catch {
      // Not persisted, still usable.
    }
  }, [palette]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">scouttech-ui</h1>
          <p className="text-sm text-ui-on-surface-muted">Demo de controles y tokens</p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <Select
              label="Tema de prueba"
              value={palette}
              onChange={(event) => setPalette(event.target.value as Palette)}
            >
              {palettes.map((name) => (
                <option key={name} value={name}>
                  {name === "scoutgroup" ? "ScoutGroup" : "ScoutLog"}
                </option>
              ))}
            </Select>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <Section title="Button">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {variants.map((variant) =>
            sizes.map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                {variant} {size}
              </Button>
            )),
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Plus size={16} aria-hidden="true" />}>Con icono</Button>
          <Button variant="outline" icon={<Mail size={16} aria-hidden="true" />}>
            Correo
          </Button>
          <Button variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} size="sm">
            Eliminar
          </Button>
          <Button loading>Guardando</Button>
          <Button disabled>Deshabilitado</Button>
          <Button variant="outline" disabled>
            Deshabilitado outline
          </Button>
        </div>
      </Section>

      <Section title="ButtonLink">
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink to="/ejemplo-interno">Enlace interno</ButtonLink>
          <ButtonLink to="/ejemplo-secundario" variant="secondary" size="sm">
            Interno sm
          </ButtonLink>
          <ButtonLink
            to="https://example.com"
            external
            target="_blank"
            variant="outline"
          >
            Enlace externo
          </ButtonLink>
        </div>
      </Section>

      <Section title="ButtonToogle">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <ButtonToogle
              value={notify}
              onChange={setNotify}
              aria-label="Notificaciones"
            />
            <span className="text-sm font-medium">Notificaciones {notify ? "activas" : "inactivas"}</span>
          </div>
          <div className="flex items-center gap-3">
            <ButtonToogle value={false} aria-label="Modo inactivo" />
            <span className="text-sm font-medium">Inactivo</span>
          </div>
          <div className="flex items-center gap-3">
            <ButtonToogle
              value
              cantInteract
              aria-label="Cookies técnicas"
            />
            <span className="text-sm font-medium">Cookies técnicas (obligatorias)</span>
          </div>
        </div>
      </Section>

      <Section title="Input">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" placeholder="Ana García" />
          <Input
            label="Correo electrónico"
            type="email"
            hint="Usaremos este correo para avisos."
          />
          <Input
            label="Teléfono"
            type="tel"
            error="Introduce un número válido"
            defaultValue="12345"
          />
          <Input
            label="Buscar"
            placeholder="Buscar grupo"
            icon={<Search size={18} aria-hidden="true" />}
          />
          <Input label="Deshabilitado" disabled defaultValue="Solo lectura" />
          <Input label="Obligatorio" required hint="Campo obligatorio" />
        </div>
      </Section>

      <Section title="Select">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Curso">
            <option value="">Elige un curso</option>
            <option value="1">Primero</option>
            <option value="2">Segundo</option>
          </Select>
          <Select label="Rama" hint="Selecciona la rama de la unidad.">
            <option value="lobatos">Lobatos</option>
            <option value="scouts">Scouts</option>
          </Select>
          <Select label="Sección" error="Selecciona una sección">
            <option value="">Sin elegir</option>
            <option value="a">A</option>
          </Select>
        </div>
      </Section>

      <Section title="ThemeToggle">
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <ThemeToggle
            labels={{ group: "Apariencia", light: "Claro", dark: "Oscuro", system: "Automático" }}
          />
        </div>
      </Section>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider storageKey={THEME_KEY}>
        <main>
          <Demo />
        </main>
      </ThemeProvider>
    </BrowserRouter>
  );
}

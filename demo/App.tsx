import { Mail, Search, Trash2, Plus, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import {
  Button,
  ButtonLink,
  ButtonToogle,
  Card,
  CookieConsent,
  FieldError,
  Input,
  Select,
  StatCard,
  ThemeProvider,
  ThemeToggle,
  buttonClassName,
  useTheme,
  type ButtonSize,
  type ButtonVariant,
  type CardVariant,
  type CookieConsentValues,
} from "../src/index.js";

const PALETTE_KEY = "scouttech-ui-demo-palette";
const THEME_KEY = "scouttech-ui-demo-theme";
type Palette = "scoutgroup" | "scoutlog" | "scouttech";
const palettes: Palette[] = ["scoutgroup", "scoutlog", "scouttech"];
const paletteNames: Record<Palette, string> = {
  scoutgroup: "ScoutGroup",
  scoutlog: "ScoutLog",
  scouttech: "ScoutTech",
};
const isPalette = (value: string | null): value is Palette =>
  palettes.includes(value as Palette);

function readInitialPalette(): Palette {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("demo");
    if (isPalette(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(PALETTE_KEY);
    if (isPalette(stored)) return stored;
  } catch {
    // Storage blocked: fall back to the default palette.
  }
  return "scoutgroup";
}

function Section({
  title,
  children,
  e2eText = false,
}: {
  title: string;
  children: ReactNode;
  /** Marks the section for the text contrast E2E check (data-e2e-text). */
  e2eText?: boolean;
}) {
  return (
    <section
      data-e2e-text={e2eText ? "" : undefined}
      className="flex flex-col gap-4 border-t border-ui-outline pt-6"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger", "danger-soft"];
const sizes: ButtonSize[] = ["sm", "md"];
const cardVariants: CardVariant[] = ["elevated", "tonal", "outlined"];

const cookieSections = [
  {
    key: "marketing",
    title: "Marketing",
    description:
      "Usamos cookies de marketing para mostrarte anuncios y contenidos adaptados a tus intereses, y para medir si esas campañas funcionan. Pueden compartir datos con socios publicitarios.",
  },
  {
    key: "analysis",
    title: "Análisis",
    description: "Nos ayudan a entender cómo se usa la aplicación para mejorarla.",
  },
  {
    key: "technical",
    title: "Técnicas",
    description: "Necesarias para iniciar sesión y recordar tus preferencias. No se pueden desactivar.",
    required: true,
  },
];

function ThemeState() {
  const { mode, resolved } = useTheme();
  return (
    <p className="text-sm text-ui-on-surface-muted">
      useTheme: mode={mode}, resolved={resolved}
    </p>
  );
}

function Demo() {
  const [palette, setPalette] = useState<Palette>(readInitialPalette);
  const [notify, setNotify] = useState(true);
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const [cookieResult, setCookieResult] = useState<CookieConsentValues | null>(null);

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
                  {paletteNames[name]}
                </option>
              ))}
            </Select>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <p className="text-sm text-ui-on-surface-muted">
        Pulsa Tab para recorrer los controles y ver el foco visible.
      </p>

      <Section title="Button">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          <Button variant="danger-soft" icon={<Trash2 size={16} aria-hidden="true" />}>
            Eliminar suave
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {variants.map((variant) => (
            <Button key={`${variant}-loading`} variant={variant} size="sm" loading>
              Cargando {variant}
            </Button>
          ))}
          {variants.map((variant) => (
            <Button key={`${variant}-disabled`} variant={variant} size="sm" disabled>
              Deshabilitado {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading>Guardando md</Button>
          <Button disabled>Deshabilitado md</Button>
          <span className={buttonClassName({ variant: "secondary", size: "sm" })}>
            buttonClassName en span
          </span>
        </div>
      </Section>

      <Section title="ButtonLink">
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((variant) =>
            sizes.map((size) => (
              <ButtonLink key={`${variant}-${size}`} to={`/${variant}`} variant={variant} size={size}>
                Enlace {variant} {size}
              </ButtonLink>
            )),
          )}
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
          <Input
            label="Con pista y error"
            hint="Mínimo 8 caracteres."
            error="Demasiado corta"
            defaultValue="abc"
          />
          <Input label="Nombre del grupo" mandatory />
          <Input label="Obligatorio con error" mandatory error="Completa este campo" />
          <Input label="Obligatorio y required" mandatory required />
          <Input
            label="Icono deshabilitado"
            disabled
            icon={<Search size={18} aria-hidden="true" />}
            defaultValue="Sin búsqueda"
          />
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
          <Select label="Deshabilitado" disabled>
            <option value="x">Solo lectura</option>
          </Select>
          <Select label="Obligatorio" required hint="Campo obligatorio">
            <option value="">Elige una opción</option>
            <option value="1">Uno</option>
          </Select>
          <Select label="Con pista y error" hint="Elige al menos una." error="Falta la selección">
            <option value="">Sin elegir</option>
          </Select>
          <Select label="Rama obligatoria" mandatory>
            <option value="lobatos">Lobatos</option>
            <option value="scouts">Scouts</option>
          </Select>
          <Select label="Rama obligatoria con error" mandatory error="Elige una rama">
            <option value="">Sin elegir</option>
          </Select>
        </div>
      </Section>

      <Section title="FieldError">
        <FieldError>Error suelto, fuera de un campo</FieldError>
      </Section>

      <Section title="Card" e2eText>
        <div className="grid gap-3 sm:grid-cols-3">
          {cardVariants.map((variant) => (
            <Card key={variant} variant={variant} className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">Tarjeta {variant}</h3>
              <p className="text-sm text-ui-on-surface-muted">Contenedor estático.</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {cardVariants.map((variant) => (
            <Card key={`${variant}-interactive`} variant={variant} interactive className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">Tarjeta {variant} interactiva</h3>
              <p className="text-sm text-ui-on-surface-muted">Sombra al pasar el ratón.</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="StatCard" e2eText>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Licencias en uso"
            value="128"
            description="Actualizado hoy"
            delta="+4,2 % mes"
            icon={<Users size={20} />}
            footer="Ver detalle"
            footerMeta="ID 042"
            testId="stat-licences"
          />
          <StatCard label="Grupos activos" value="14" />
          <StatCard
            variant="tonal"
            label="Unidades"
            value="37"
            description="Incluye unidades inactivas"
          />
          <StatCard
            variant="outlined"
            label="Pendientes"
            value="6"
            footer="Revisar"
          />
        </div>
      </Section>

      <Section title="CookieConsent" e2eText>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setCookiesOpen(true)}>Configurar cookies</Button>
        </div>
        {cookiesOpen && (
          <CookieConsent
            title="Selecciona cómo tratamos tu información"
            description="Puedes aceptar todas las cookies, elegir cuáles quieres o rechazar las opcionales."
            sections={cookieSections}
            initial={{ marketing: true, analysis: true }}
            rejectOptionalLabel="Rechazar opcionales"
            moreInfo={
              <ButtonLink to="/cookies" variant="ghost" size="sm">
                Saber más
              </ButtonLink>
            }
            onSubmit={(values: CookieConsentValues) => {
              setCookiesOpen(false);
              setCookieResult(values);
            }}
          />
        )}
        {cookieResult && (
          <p data-testid="cookie-result" className="text-sm text-ui-on-surface-muted">
            Preferencias: {JSON.stringify(cookieResult)}
          </p>
        )}
      </Section>

      <Section title="ThemeToggle">
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <ThemeToggle
            labels={{ group: "Apariencia", light: "Claro", dark: "Oscuro", system: "Automático" }}
          />
          <ThemeState />
        </div>
      </Section>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter>
      <ThemeProvider storageKey={THEME_KEY}>
        <main>
          <Demo />
        </main>
      </ThemeProvider>
    </MemoryRouter>
  );
}

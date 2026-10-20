import { Mail, Search, Trash2, Plus, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import {
  AuthBrandHeader,
  Badge,
  EmptyState,
  Skeleton,
  TabPanel,
  Tabs,
  Button,
  ButtonLink,
  ButtonToogle,
  Card,
  CookieConsent,
  ProductMark,
  FieldError,
  Checkbox,
  Column,
  ColumnInverted,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Row,
  RowInverted,
  Select,
  Textarea,
  StatCard,
  ThemeProvider,
  ThemeToggle,
  buttonClassName,
  useTheme,
  type ButtonSize,
  type ButtonVariant,
  type CardVariant,
  productNames,
  products,
  type BadgeTone,
  type CookieConsentValues,
  type ModalSize,
  type Product,
} from "../src/index.js";

import scoutgroupTheme from "../themes/scoutgroup.css?raw";
import scoutlogTheme from "../themes/scoutlog.css?raw";
import scoutpulseTheme from "../themes/scoutpulse.css?raw";
import scouttechTheme from "../themes/scouttech.css?raw";

const PALETTE_KEY = "scouttech-ui-demo-palette";
const THEME_KEY = "scouttech-ui-demo-theme";
const EMBED_KEY_PREFIX = "scouttech-ui-demo-embed-";
type Palette = "scoutgroup" | "scoutlog" | "scoutpulse" | "scouttech";
const palettes: Palette[] = ["scoutgroup", "scoutlog", "scoutpulse", "scouttech"];
const paletteNames: Record<Palette, string> = {
  scoutgroup: "ScoutGroup",
  scoutlog: "ScoutLog",
  scoutpulse: "ScoutPulse",
  scouttech: "ScoutTech",
};
const brandThemes: Record<Palette, string> = {
  scoutgroup: scoutgroupTheme,
  scoutlog: scoutlogTheme,
  scoutpulse: scoutpulseTheme,
  scouttech: scouttechTheme,
};
const isPalette = (value: string | null): value is Palette =>
  palettes.includes(value as Palette);

/** Writes the selected shipped brand theme into one <style> element (created once). */
function applyBrandTheme(palette: Palette) {
  let style = document.getElementById("demo-brand-theme") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "demo-brand-theme";
    document.head.appendChild(style);
  }
  style.textContent = brandThemes[palette];
}

/**
 * `?embed=1&demo=<brand>&theme=light|dark` is used by the compare view iframes. The embed
 * forces its mode through a per-brand/per-mode storage key, so it never reads or writes the
 * parent's palette or theme preference.
 */
type EmbedConfig = { palette: Palette; theme: "light" | "dark"; storageKey: string };
function readEmbedConfig(): EmbedConfig | null {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("embed") !== "1") return null;
    const demo = params.get("demo");
    const palette: Palette = isPalette(demo) ? demo : "scoutgroup";
    const theme = params.get("theme") === "dark" ? "dark" : "light";
    const storageKey = `${EMBED_KEY_PREFIX}${palette}-${theme}`;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Storage blocked: the embed still renders with the forced mode.
    }
    return { palette, theme, storageKey };
  } catch {
    return null;
  }
}
const embedConfig = readEmbedConfig();

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
const markSizes = [16, 24, 32, 64];
const loginProducts: Product[] = ["scouttech", "scoutgroup", "scoutlog", "scoutpulse"];

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

function CompareView() {
  // One row per brand: light on the left, dark on the right (md and up).
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {palettes.flatMap((brand) =>
        (["light", "dark"] as const).map((mode) => (
          <iframe
            key={`${brand}-${mode}`}
            title={`${paletteNames[brand]} ${mode === "light" ? "claro" : "oscuro"}`}
            src={`?${new URLSearchParams({ embed: "1", demo: brand, theme: mode }).toString()}`}
            loading="lazy"
            className="h-[600px] w-full rounded-ui-card border border-ui-outline"
          />
        )),
      )}
    </div>
  );
}

function Demo() {
  const [palette, setPalette] = useState<Palette>(() => embedConfig?.palette ?? readInitialPalette());
  const [compare, setCompare] = useState(false);
  const [notify, setNotify] = useState(true);
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const [modalSize, setModalSize] = useState<ModalSize | null>(null);
  const [tab, setTab] = useState("uno");
  const [cookieResult, setCookieResult] = useState<CookieConsentValues | null>(null);

  useEffect(() => {
    document.documentElement.dataset.demo = palette;
    applyBrandTheme(palette);
    if (embedConfig) return;
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
              label="Marca"
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
          <Button variant="outline" size="sm" onClick={() => setCompare((value) => !value)}>
            {compare ? "Volver" : "Comparar 4 marcas"}
          </Button>
          {!embedConfig && <ThemeToggle />}
        </div>
      </header>

      {compare ? (
        <CompareView />
      ) : (
        <>
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

      <Section title="Textarea">
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Observaciones" placeholder="Escribe aquí" />
          <Textarea label="Con pista" hint="Máximo 500 caracteres." />
          <Textarea label="Con error" error="Campo requerido" />
          <Textarea label="Deshabilitado" disabled defaultValue="Solo lectura" />
          <Textarea label="Obligatorio" required hint="Campo obligatorio" />
          <Textarea label="Obligatorio visual" mandatory />
          <Textarea label="Obligatorio con error" mandatory error="Completa este campo" />
        </div>
      </Section>

      <Section title="Checkbox">
        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox label="Acepto los términos" />
          <Checkbox label="Marcado" defaultChecked hint="Con pista" />
          <Checkbox label="Con error" error="Debes aceptar" />
          <Checkbox label="Deshabilitado" disabled />
          <Checkbox label="Deshabilitado marcado" disabled defaultChecked />
          <Checkbox label="Obligatorio" required />
          <Checkbox label="Obligatorio visual" mandatory />
          <Checkbox label="Obligatorio con error" mandatory error="Debes aceptar" />
        </div>
      </Section>

      <Section title="Radio">
        <div className="grid gap-4 sm:grid-cols-2">
          <RadioGroup label="Rama" hint="Elige una rama.">
            <Radio label="Lobatos" value="lobatos" defaultChecked />
            <Radio label="Scouts" value="scouts" />
          </RadioGroup>
          <RadioGroup label="Sección" error="Selecciona una sección">
            <Radio label="A" value="a" />
            <Radio label="B" value="b" />
          </RadioGroup>
          <RadioGroup label="Deshabilitado" disabled>
            <Radio label="Uno" value="1" defaultChecked />
            <Radio label="Dos" value="2" />
          </RadioGroup>
          <RadioGroup label="Obligatorio" required>
            <Radio label="Sí" value="si" />
            <Radio label="No" value="no" />
          </RadioGroup>
          <RadioGroup label="Obligatorio visual" mandatory>
            <Radio label="Sí" value="si" />
            <Radio label="No" value="no" />
          </RadioGroup>
          <RadioGroup label="Obligatorio con error" mandatory error="Elige una opción">
            <Radio label="Sí" value="si" />
            <Radio label="No" value="no" />
          </RadioGroup>
        </div>
      </Section>

      <Section title="Layout">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card variant="outlined">
            <p className="mb-2 text-sm font-medium">Row</p>
            <Row className="gap-2">
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">1</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">2</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">3</span>
            </Row>
          </Card>
          <Card variant="outlined">
            <p className="mb-2 text-sm font-medium">Column</p>
            <Column className="gap-2">
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">1</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">2</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">3</span>
            </Column>
          </Card>
          <Card variant="outlined">
            <p className="mb-2 text-sm font-medium">RowInverted</p>
            <RowInverted className="gap-2">
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">1</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">2</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">3</span>
            </RowInverted>
          </Card>
          <Card variant="outlined">
            <p className="mb-2 text-sm font-medium">ColumnInverted</p>
            <ColumnInverted className="gap-2">
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">1</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">2</span>
              <span className="rounded-ui-control bg-ui-surface-tonal px-3 py-1 text-sm text-ui-on-surface">3</span>
            </ColumnInverted>
          </Card>
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

      <Section title="Modal" e2eText>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setModalSize("md")}>Abrir modal</Button>
          <Button variant="outline" onClick={() => setModalSize("sm")}>
            Modal pequeño
          </Button>
          <Button variant="outline" onClick={() => setModalSize("lg")}>
            Modal grande
          </Button>
        </div>
        {modalSize && (
          <Modal title="Modal de ejemplo" size={modalSize} onClose={() => setModalSize(null)}>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ui-on-surface-muted">
                Escape, clic fuera o la X cierran el modal. Tab queda atrapado dentro.
              </p>
              <Input label="Nombre" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalSize(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => setModalSize(null)}>Guardar</Button>
              </div>
            </div>
          </Modal>
        )}
      </Section>

      <Section title="Badge" e2eText>
        <div className="flex flex-wrap items-center gap-2">
          {(["neutral", "primary", "success", "warning", "danger", "info"] as BadgeTone[]).map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
          <Badge tone="custom" className="bg-ui-surface-tonal text-ui-on-surface">
            custom
          </Badge>
        </div>
      </Section>

      <Section title="Tabs" e2eText>
        <Tabs
          label="Secciones de ejemplo"
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "uno", label: "Uno" },
            { id: "dos", label: "Dos", badge: <Badge tone="primary">3</Badge> },
            { id: "tres", label: "Tres" },
          ]}
        />
        <TabPanel id={tab} className="mt-3 text-sm">
          Contenido de la pestaña {tab}
        </TabPanel>
      </Section>

      <Section title="EmptyState" e2eText>
        <div className="grid gap-4 sm:grid-cols-2">
          <EmptyState
            title="Sin eventos"
            description="Crea el primero para empezar."
            action={<Button>Crear evento</Button>}
          />
          <EmptyState title="Sin resultados" />
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="flex flex-col gap-2">
          <Skeleton />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="size-12 rounded-full" />
        </div>
      </Section>

      <Section title="Marca y semánticos" e2eText>
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-ui-primary-ink underline underline-offset-4">
            Enlace de marca
          </span>
          <span className="rounded-full bg-ui-primary-soft px-3 py-1 text-sm font-medium text-ui-primary-ink">
            Etiqueta de marca
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-ui-success">Éxito: los cambios se han guardado.</p>
          <p className="text-ui-warning">Atención: revisa los datos antes de continuar.</p>
          <p className="text-ui-info">Información: el aviso se envía mañana.</p>
          <p className="text-ui-danger">Error: no se pudo completar la acción.</p>
        </div>
      </Section>

      <Section title="Marcas de producto">
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <div key={product} className="flex flex-wrap items-end gap-6">
              <span className="w-28 text-sm font-medium">{productNames[product]}</span>
              {markSizes.map((size) => (
                <ProductMark key={size} product={product} size={size} title={`${productNames[product]} ${size}px`} />
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cabecera de login" e2eText>
        <div className="grid gap-6 sm:grid-cols-2">
          {loginProducts.map((product) => (
            <Card key={product} variant="outlined" className="flex flex-col">
              <AuthBrandHeader
                product={product}
                accountInfoHref="/cuenta"
              />
            </Card>
          ))}
        </div>
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
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter>
      <ThemeProvider
        storageKey={embedConfig?.storageKey ?? THEME_KEY}
        defaultMode={embedConfig?.theme ?? "system"}
      >
        <main>
          <Demo />
        </main>
      </ThemeProvider>
    </MemoryRouter>
  );
}

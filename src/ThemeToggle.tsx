import { Monitor, Moon, Sun } from "lucide-react";
import { cx } from "./cx.js";
import { useTheme, type ThemeMode } from "./theme.js";

export type ThemeToggleLabels = {
  group?: string;
  light?: string;
  dark?: string;
  system?: string;
};

export type ThemeToggleProps = {
  className?: string;
  labels?: ThemeToggleLabels;
};

const defaultLabels: Required<ThemeToggleLabels> = {
  group: "Tema de la interfaz",
  light: "Tema claro",
  dark: "Tema oscuro",
  system: "Seguir al sistema",
};

const modes: Array<{ mode: ThemeMode; icon: typeof Sun }> = [
  { mode: "light", icon: Sun },
  { mode: "dark", icon: Moon },
  { mode: "system", icon: Monitor },
];

/** Three-state theme switch: light / dark / follow the operating system. */
export function ThemeToggle({ className, labels }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const text = { ...defaultLabels, ...labels };

  return (
    <div
      role="radiogroup"
      aria-label={text.group}
      className={cx(
        "inline-flex items-center gap-1 rounded-full border border-ui-outline bg-ui-surface-hover p-1",
        className,
      )}
    >
      {modes.map(({ mode: value, icon: Icon }) => {
        const label = text[value];
        const checked = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            onClick={() => setMode(value)}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus",
              checked
                ? "bg-ui-primary text-ui-on-primary"
                : "text-ui-on-surface-muted hover:bg-ui-surface-active",
            )}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;

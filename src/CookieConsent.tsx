import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "./Button.js";
import { ButtonToogle } from "./ButtonToogle.js";
import { Card } from "./Card.js";
import { cx } from "./cx.js";

export type CookieConsentSection = {
  key: string;
  title: ReactNode;
  description: ReactNode;
  /** Always on, switch locked (e.g. technical cookies). */
  required?: boolean;
};

export type CookieConsentValues = Record<string, boolean>;

export type CookieConsentProps = {
  title: ReactNode;
  /** Optional intro paragraph under the title. */
  description?: ReactNode;
  sections: CookieConsentSection[];
  /** Initial switch values by section key. Missing optional keys start off; required ones are always on. */
  initial?: CookieConsentValues;
  onSubmit: (values: CookieConsentValues) => void;
  /** e.g. the app's <Link> to its cookie policy. */
  moreInfo?: ReactNode;
  acceptSelectionLabel?: string;
  acceptAllLabel?: string;
  /** When set, shows a button that accepts only the required sections. */
  rejectOptionalLabel?: string;
  requiredLabel?: string;
  className?: string;
};

/** Builds the full value map: required sections are always true, the rest come from `pick`. */
function resolveValues(
  sections: CookieConsentSection[],
  pick: (key: string) => boolean,
): CookieConsentValues {
  return Object.fromEntries(
    sections.map((section) => [section.key, Boolean(section.required) || pick(section.key)]),
  );
}

/**
 * Cookie preferences dialog (modal). Persistence is the app's job: store the values in onSubmit.
 * Focuses itself on mount and renders its own backdrop.
 */
export function CookieConsent({
  title,
  description,
  sections,
  initial = {},
  onSubmit,
  moreInfo,
  acceptSelectionLabel = "Aceptar selección",
  acceptAllLabel = "Aceptar todas",
  rejectOptionalLabel,
  requiredLabel = "(Obligatorias)",
  className,
}: CookieConsentProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<CookieConsentValues>(() =>
    resolveValues(sections, (key) => initial[key] ?? false),
  );

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const submit = (next: CookieConsentValues) => {
    setValues(next);
    onSubmit(next);
  };

  const handleSelection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(resolveValues(sections, (key) => values[key] ?? false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-overlay p-4">
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(
          "flex max-h-full w-full max-w-xl flex-col gap-4 overflow-y-auto overflow-x-hidden outline-none sm:min-w-96",
          className,
        )}
      >
        <h2 id={titleId} className="text-xl font-semibold break-words">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-sm text-ui-on-surface-muted">
            {description}
          </p>
        )}
        <form onSubmit={handleSelection} className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-ui-outline">
            {sections.map((section) => {
              const sectionTitleId = `${baseId}-${section.key}-title`;
              const sectionDescId = `${baseId}-${section.key}-desc`;
              return (
                <li key={section.key} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <h3 id={sectionTitleId} className="text-base font-semibold break-words">
                      {section.title}
                      {section.required && (
                        <span className="ml-2 text-xs font-normal italic text-ui-on-surface-muted">
                          {requiredLabel}
                        </span>
                      )}
                    </h3>
                    <p id={sectionDescId} className="text-sm text-ui-on-surface-muted break-words">
                      {section.description}
                    </p>
                  </div>
                  <ButtonToogle
                    value={values[section.key] ?? false}
                    cantInteract={section.required}
                    onChange={(next) => setValues((prev) => ({ ...prev, [section.key]: next }))}
                    aria-labelledby={sectionTitleId}
                    aria-describedby={sectionDescId}
                  />
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {moreInfo && <div className="mr-auto">{moreInfo}</div>}
            {rejectOptionalLabel && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => submit(resolveValues(sections, () => false))}
              >
                {rejectOptionalLabel}
              </Button>
            )}
            <Button type="submit" variant="secondary">
              {acceptSelectionLabel}
            </Button>
            <Button type="button" onClick={() => submit(resolveValues(sections, () => true))}>
              {acceptAllLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CookieConsent;

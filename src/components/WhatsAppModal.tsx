import { useEffect, useRef, useState } from "react";
import type { WhatsAppTemplates } from "../../shared/types";
import { buildWhatsAppUrl, openWhatsApp, type WaRequest } from "../lib/whatsapp";

interface Props {
  templates: WhatsAppTemplates;
  whatsappNumber: string;
}

export function WhatsAppModal({ templates, whatsappNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [req, setReq] = useState<WaRequest | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<WaRequest>).detail;
      setReq(detail);
      setName("");
      setError("");
      setOpen(true);
    };
    window.addEventListener("natlus:wa-request", handler);
    return () => window.removeEventListener("natlus:wa-request", handler);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open || !req) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }
    setError("");
    const url = buildWhatsAppUrl(whatsappNumber, templates, trimmed, req);
    openWhatsApp(url);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Request via WhatsApp — enter your name">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover animate-fade-up dark:bg-ink-900">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-ink-800"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.88-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.04-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.08.15.13.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.39-.45.52-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.3.15.48.13.66-.08.18-.2.76-.88.96-1.19.2-.3.4-.25.68-.15.28.1 1.78.84 2.08.99.3.15.5.23.58.35.07.13.07.73-.18 1.43z" />
          </svg>
          WhatsApp
        </div>
        <h3 className="text-xl font-bold text-ink-900 dark:text-white">Request via WhatsApp</h3>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
          Tell us your name — we'll open WhatsApp with your request ready to send.
          {req.kind === "service" && req.label && <span className="block font-medium text-ink-700 dark:text-ink-200">Selected service: {req.label}</span>}
          {req.kind === "package" && req.label && <span className="block font-medium text-ink-700 dark:text-ink-200">Selected package: {req.label}</span>}
          {req.kind === "project" && req.label && <span className="block font-medium text-ink-700 dark:text-ink-200">Reference project: {req.label}</span>}
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <div>
            <label htmlFor="wa-name" className="label">
              Your name
            </label>
            <input
              id="wa-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada Obi"
              autoComplete="name"
              className="input"
              aria-invalid={!!error}
              aria-describedby={error ? "wa-name-error" : undefined}
            />
            {error && (
              <p id="wa-name-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
          <p className="text-xs text-ink-400 dark:text-ink-400">
            We only ask for your name — no email or phone number needed.
          </p>
          <button type="submit" className="btn-whatsapp w-full">
            Open WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}

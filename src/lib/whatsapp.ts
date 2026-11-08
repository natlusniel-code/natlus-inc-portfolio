import type { WhatsAppTemplates } from "../../shared/types";

export type WaKind = "service" | "package" | "project" | "general";

export interface WaRequest {
  kind: WaKind;
  /** service title, package name, or project title */
  label: string;
  /** displayed starting price, if any */
  price?: string;
}

function fill(template: string, name: string, req: WaRequest): string {
  const n = name.trim();
  return template
    .replace(/\[NAME\]/g, n)
    .replace(/\[SELECTED SERVICE\]/g, req.kind === "service" ? req.label : "selected")
    .replace(/\[PACKAGE NAME\]/g, req.kind === "package" ? req.label : "selected")
    .replace(/\[PROJECT NAME\]/g, req.kind === "project" ? req.label : "this project")
    .replace(/\[PRICE\]/g, req.price ?? "our starting price")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildWhatsAppUrl(number: string, templates: WhatsAppTemplates, name: string, req: WaRequest): string {
  const tpl =
    req.kind === "package" ? templates.package : req.kind === "project" ? templates.project : req.kind === "service" ? templates.service : templates.general;
  const message = fill(tpl, name, req);
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

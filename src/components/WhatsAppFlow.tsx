/** Opens the name-only WhatsApp request modal. Call with a WaRequest to pre-fill context. */
export function openWaModal(req: { kind: "service" | "package" | "project" | "general"; label: string; price?: string }): void {
  window.dispatchEvent(new CustomEvent("natlus:wa-request", { detail: req }));
}

export { WhatsAppModal } from "./WhatsAppModal";

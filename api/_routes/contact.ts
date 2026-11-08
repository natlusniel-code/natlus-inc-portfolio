import { errorResponse, json } from "../_core/http.js";
import { saveMessage } from "../_core/messages.js";

/**
 * Public contact form endpoint.
 * Always persists the message to the database (the /natlus admin panel shows
 * it under "Messages"). If SMTP env vars are configured it also forwards by
 * email; otherwise the client tells the visitor the message is stored and
 * will be reviewed — it never fakes a "sent" email.
 */
export async function contactRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname !== "/api/contact") return json({ ok: false, error: "Not found." }, "no-store", 404);
  if (req.method !== "POST") return json({ ok: false, error: "Use POST." }, "no-store", 405);

  try {
    const body = await readJson(req);
    if (body === null) return json({ ok: false, error: "Expected a JSON body." }, "no-store", 400);
    const saved = await saveMessage(body);
    const emailSent = await maybeMail(body as Record<string, unknown>);
    return json({ ok: true, id: saved.id, emailSent });
  } catch (e) {
    return errorResponse(e);
  }
}

async function maybeMail(v: Record<string, unknown>): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) return false;
  try {
    const to = CONTACT_TO;
    const from = SMTP_FROM || `Natlus Inc. <${SMTP_USER}>`;
    const subject = `New project enquiry from ${String(v.name ?? "visitor")}`;
    const text = [
      `Name: ${String(v.name ?? "")}`,
      `Email: ${String(v.email ?? "")}`,
      `Service: ${String(v.service ?? "")}`,
      `Budget: ${String(v.budget ?? "")}`,
      "",
      String(v.description ?? ""),
    ].join("\n");
    const { sendSmtpMail } = await import("./smtp.js");
    await sendSmtpMail({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), user: SMTP_USER, pass: SMTP_PASS, from, to, subject, text });
    return true;
  } catch (e) {
    console.error("[contact] email forward failed:", e);
    return false;
  }
}

async function readJson(req: Request): Promise<unknown | null> {
  try {
    const text = await req.text();
    if (!text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

import { useCallback, useEffect, useState } from "react";
import type { ContentBundle, ContentKey, ContentListKey, ContactMessage } from "../../shared/types";
import { loadBundle, loadMessages, removeMessage, setMessageRead } from "./api";
import { SingletonEditor } from "./SingletonEditor";
import { ListManager } from "./ListManager";

type Toast = { kind: "ok" | "err"; msg: string } | null;

const SINGLETONS: Array<{ key: ContentKey; label: string; group: string }> = [
  { key: "company", label: "Company details", group: "Site content" },
  { key: "ceo", label: "CEO / founder profile", group: "Site content" },
  { key: "hero", label: "Hero section", group: "Site content" },
  { key: "contact", label: "Contact details", group: "Site content" },
  { key: "whatsapp", label: "WhatsApp templates", group: "Site content" },
  { key: "footer", label: "Footer & policies", group: "Site content" },
  { key: "pricing", label: "Pricing note", group: "Site content" },
  { key: "portfolioCategories", label: "Portfolio categories", group: "Site content" },
  { key: "seo", label: "SEO settings", group: "Settings" },
  { key: "settings", label: "Colors, fonts & theme", group: "Settings" },
];

const LISTS: Array<{ key: ContentListKey; label: string }> = [
  { key: "services", label: "Services" },
  { key: "packages", label: "Pricing packages" },
  { key: "projects", label: "Portfolio projects" },
  { key: "process", label: "Process steps" },
  { key: "benefits", label: "Why-choose-us cards" },
  { key: "testimonials", label: "Testimonials" },
  { key: "faqs", label: "FAQs" },
  { key: "socials", label: "Social links" },
];

type View = { kind: "dashboard" } | { kind: "singleton"; key: ContentKey } | { kind: "list"; key: ContentListKey } | { kind: "messages" };

export default function AdminApp() {
  const [bundle, setBundle] = useState<ContentBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "dashboard" });
  const [toast, setToast] = useState<Toast>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [navOpen, setNavOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const b = await loadBundle();
      setBundle(b);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Content could not be loaded.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (view.kind === "messages") {
      loadMessages().then(setMessages).catch(() => setMessages([]));
    }
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (kind: "ok" | "err", msg: string) => setToast({ kind, msg });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6 dark:bg-ink-950">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-ink-900">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-300">Admin content isn't available</h1>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{error}</p>
          <p className="mt-3 text-xs text-ink-400">
            Run <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">npm run db:migrate</code> and <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">npm run db:seed</code> against the production DATABASE_URL.
          </p>
          <button type="button" onClick={() => void refresh()} className="btn-primary mt-5">Try again</button>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return <div className="flex min-h-screen items-center justify-center bg-ink-50 text-sm text-ink-400 dark:bg-ink-950">Loading admin…</div>;
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* ===== Prominent admin banner / signature ===== */}
      <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Administrator area</p>
              <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{bundle.company.companyName} — Admin Panel</h1>
              <p className="text-xs text-white/70">You are editing the live website. Changes save to the database and appear immediately.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25">
              View live site ↗
            </a>
            <button type="button" onClick={() => setNavOpen((o) => !o)} className="rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold ring-1 ring-white/25 lg:hidden" aria-label="Toggle admin menu" aria-expanded={navOpen}>
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ===== Sidebar ===== */}
        <aside className={`${navOpen ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-64`}>
          <nav className="space-y-6 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900" aria-label="Admin sections">
            <button type="button" onClick={() => { setView({ kind: "dashboard" }); setNavOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${view.kind === "dashboard" ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"}`}>
              Dashboard
            </button>
            <button type="button" onClick={() => { setView({ kind: "messages" }); setNavOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${view.kind === "messages" ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"}`}>
              Messages
              {unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>}
            </button>

            <div>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Site content</p>
              <ul className="space-y-0.5">
                {SINGLETONS.filter((s) => s.group === "Site content").map((s) => (
                  <li key={s.key}>
                    <button type="button" onClick={() => { setView({ kind: "singleton", key: s.key }); setNavOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${view.kind === "singleton" && view.key === s.key ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"}`}>
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Collections</p>
              <ul className="space-y-0.5">
                {LISTS.map((l) => (
                  <li key={l.key}>
                    <button type="button" onClick={() => { setView({ kind: "list", key: l.key }); setNavOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${view.kind === "list" && view.key === l.key ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"}`}>
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Settings</p>
              <ul className="space-y-0.5">
                {SINGLETONS.filter((s) => s.group === "Settings").map((s) => (
                  <li key={s.key}>
                    <button type="button" onClick={() => { setView({ kind: "singleton", key: s.key }); setNavOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${view.kind === "singleton" && view.key === s.key ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"}`}>
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* ===== Main ===== */}
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
            {view.kind === "dashboard" && <Dashboard bundle={bundle} onGo={setView} />}
            {view.kind === "singleton" && (
              <>
                <h2 className="mb-5 text-xl font-bold text-ink-900 dark:text-white">{SINGLETONS.find((s) => s.key === view.key)?.label}</h2>
                <SingletonEditor which={view.key} bundle={bundle} onSaved={refresh} toast={showToast} />
              </>
            )}
            {view.kind === "list" && (
              <>
                <h2 className="mb-5 text-xl font-bold text-ink-900 dark:text-white">{LISTS.find((l) => l.key === view.key)?.label}</h2>
                <ListManager list={view.key} bundle={bundle} onChanged={refresh} toast={showToast} />
              </>
            )}
            {view.kind === "messages" && (
              <MessagesView messages={messages} onChanged={() => { loadMessages().then(setMessages).catch(() => {}); }} toast={showToast} />
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${toast.kind === "ok" ? "bg-green-600" : "bg-red-600"}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Dashboard({ bundle, onGo }: { bundle: ContentBundle; onGo: (v: View) => void }) {
  const cards: Array<{ label: string; count: number; view: View }> = [
    { label: "Services", count: bundle.services.length, view: { kind: "list", key: "services" } },
    { label: "Pricing packages", count: bundle.packages.length, view: { kind: "list", key: "packages" } },
    { label: "Portfolio projects", count: bundle.projects.length, view: { kind: "list", key: "projects" } },
    { label: "Process steps", count: bundle.process.length, view: { kind: "list", key: "process" } },
    { label: "Why-choose-us cards", count: bundle.benefits.length, view: { kind: "list", key: "benefits" } },
    { label: "Testimonials", count: bundle.testimonials.length, view: { kind: "list", key: "testimonials" } },
    { label: "FAQs", count: bundle.faqs.length, view: { kind: "list", key: "faqs" } },
    { label: "Social links", count: bundle.socials.length, view: { kind: "list", key: "socials" } },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold text-ink-900 dark:text-white">Dashboard</h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">Everything on the public website is editable from here. Pick a section to begin.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => onGo(c.view)} className="rounded-xl border border-ink-200 p-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-800 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
            <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{c.count}</p>
            <p className="mt-1 text-sm font-medium text-ink-600 dark:text-ink-300">{c.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50 p-5 dark:border-ink-800 dark:bg-ink-800/40">
        <h3 className="text-sm font-bold text-ink-900 dark:text-white">Quick actions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onGo({ kind: "singleton", key: "hero" })} className="btn-secondary text-xs">Edit hero</button>
          <button type="button" onClick={() => onGo({ kind: "singleton", key: "contact" })} className="btn-secondary text-xs">Edit contact details</button>
          <button type="button" onClick={() => onGo({ kind: "singleton", key: "whatsapp" })} className="btn-secondary text-xs">Edit WhatsApp templates</button>
          <button type="button" onClick={() => onGo({ kind: "singleton", key: "settings" })} className="btn-secondary text-xs">Colors & theme</button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">View live site ↗</a>
        </div>
      </div>
    </div>
  );
}

function MessagesView({ messages, onChanged, toast }: { messages: ContactMessage[]; onChanged: () => void; toast: (k: "ok" | "err", m: string) => void }) {
  if (messages.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-ink-900 dark:text-white">Messages</h2>
        <p className="mt-4 rounded-xl border border-dashed border-ink-300 p-8 text-center text-sm text-ink-400 dark:border-ink-700">
          No enquiries yet. Messages sent through the contact form appear here.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-ink-900 dark:text-white">Messages</h2>
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={`rounded-xl border p-4 ${m.read ? "border-ink-200 dark:border-ink-800" : "border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-900/20"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-ink-900 dark:text-white">{m.name} {!m.read && <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">new</span>}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                  {m.service && ` · ${m.service}`}
                  {m.budget && ` · ${m.budget}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={async () => { await setMessageRead(m.id, !m.read); onChanged(); }} className="btn-secondary text-xs">{m.read ? "Mark unread" : "Mark read"}</button>
                <button type="button" onClick={async () => { if (confirm("Delete this message?")) { await removeMessage(m.id); toast("ok", "Message deleted."); onChanged(); } }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Delete</button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-ink-600 dark:text-ink-300">{m.description}</p>
            <p className="mt-2 text-[11px] text-ink-400">{new Date(m.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

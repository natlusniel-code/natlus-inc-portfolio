import { useState } from "react";
import type { ContentBundle, ContentListKey } from "../../shared/types";
import { createItem, deleteItem, reorder, updateItem } from "./api";
import { BoolField, ImageField, ListField, TextAreaField, TextField } from "./fields";

type Toast = (kind: "ok" | "err", msg: string) => void;
type AnyItem = Record<string, unknown> & { id: number };

const LABELS: Record<ContentListKey, { title: string; singular: string }> = {
  services: { title: "Services", singular: "service" },
  packages: { title: "Pricing packages", singular: "package" },
  projects: { title: "Portfolio projects", singular: "project" },
  process: { title: "Process steps", singular: "step" },
  benefits: { title: "Why-choose-us cards", singular: "card" },
  testimonials: { title: "Testimonials", singular: "testimonial" },
  faqs: { title: "FAQs", singular: "FAQ" },
  socials: { title: "Social links", singular: "link" },
};

export function ListManager({ list, bundle, onChanged, toast }: { list: ContentListKey; bundle: ContentBundle; onChanged: () => void; toast: Toast }) {
  const items = bundle[list] as unknown as AnyItem[];
  const [editing, setEditing] = useState<AnyItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AnyItem | null>(null);
  const [busy, setBusy] = useState(false);
  const meta = LABELS[list];

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    try {
      await reorder(list, next.map((i) => i.id));
      toast("ok", "Order updated.");
      onChanged();
    } catch (e) {
      toast("err", e instanceof Error ? e.message : "Reorder failed.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteItem(list, confirmDelete.id);
      toast("ok", `${meta.singular} deleted.`);
      setConfirmDelete(null);
      onChanged();
    } catch (e) {
      toast("err", e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (data: Record<string, unknown>, id?: number) => {
    setBusy(true);
    try {
      if (id) {
        await updateItem(list, id, data);
        toast("ok", `${meta.singular} updated.`);
      } else {
        await createItem(list, data);
        toast("ok", `${meta.singular} added.`);
      }
      setEditing(null);
      setCreating(false);
      onChanged();
    } catch (e) {
      toast("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-ink-300">{items.length} {items.length === 1 ? meta.singular : `${meta.singular}s`}</p>
        <button type="button" className="btn-primary" onClick={() => { setCreating(true); setEditing(null); }}>+ Add {meta.singular}</button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 rounded-2xl border border-brand-300 bg-brand-50/50 p-5 dark:border-brand-800 dark:bg-brand-900/20">
          <h3 className="mb-4 font-bold text-ink-900 dark:text-white">{editing ? `Edit ${meta.singular}` : `New ${meta.singular}`}</h3>
          <ItemForm list={list} initial={editing ?? undefined} busy={busy} onCancel={() => { setCreating(false); setEditing(null); }} onSave={(data) => save(data, editing?.id)} />
        </div>
      )}

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || busy} className="rounded px-1.5 text-ink-400 hover:text-ink-700 disabled:opacity-30 dark:hover:text-white" aria-label="Move up">▲</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1 || busy} className="rounded px-1.5 text-ink-400 hover:text-ink-700 disabled:opacity-30 dark:hover:text-white" aria-label="Move down">▼</button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{primaryLabel(list, item)}</p>
              <p className="truncate text-xs text-ink-400">{secondaryLabel(list, item)}</p>
            </div>
            <button type="button" onClick={() => { setEditing(item); setCreating(false); }} className="btn-secondary text-xs">Edit</button>
            <button type="button" onClick={() => setConfirmDelete(item)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Delete</button>
          </li>
        ))}
      </ul>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-hover dark:bg-ink-900">
            <h3 className="text-lg font-bold text-ink-900 dark:text-white">Delete this {meta.singular}?</h3>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              “{primaryLabel(list, confirmDelete)}” will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={doDelete} disabled={busy} className="flex-1 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function primaryLabel(list: ContentListKey, item: AnyItem): string {
  if (list === "packages") return String(item.name ?? "");
  if (list === "faqs") return String(item.question ?? "");
  if (list === "socials") return String(item.label ?? "");
  return String(item.title ?? item.name ?? "");
}

function secondaryLabel(list: ContentListKey, item: AnyItem): string {
  if (list === "services") return String(item.startingPrice ?? "");
  if (list === "packages") return String(item.startingPrice ?? "");
  if (list === "projects") return String(item.category ?? "");
  if (list === "testimonials") return `${String(item.role ?? "")}${item.company ? `, ${String(item.company)}` : ""}`;
  if (list === "socials") return String(item.url ?? "") || "no URL set";
  return String(item.description ?? item.answer ?? "").slice(0, 90);
}

function ItemForm({ list, initial, busy, onCancel, onSave }: { list: ContentListKey; initial?: AnyItem; busy: boolean; onCancel: () => void; onSave: (data: Record<string, unknown>) => void }) {
  const [d, setD] = useState<Record<string, unknown>>(() => ({ ...(initial ?? {}) }));
  const set = (k: string, v: unknown) => setD((prev) => ({ ...prev, [k]: v }));
  const s = (k: string) => String(d[k] ?? "");
  const arr = (k: string) => (Array.isArray(d[k]) ? (d[k] as string[]) : []);

  const fields = (() => {
    switch (list) {
      case "services":
        return (
          <>
            <TextField label="Title" value={s("title")} onChange={(v) => set("title", v)} />
            <TextAreaField label="Description" value={s("description")} onChange={(v) => set("description", v)} rows={3} />
            <ListField label="Deliverables" value={arr("deliverables")} onChange={(v) => set("deliverables", v)} />
            <TextField label="Starting price" value={s("startingPrice")} onChange={(v) => set("startingPrice", v)} hint="e.g. from NGN 150,000" />
            <TextField label="Icon" value={s("icon")} onChange={(v) => set("icon", v)} hint="An emoji, e.g. 🌐" />
          </>
        );
      case "packages":
        return (
          <>
            <TextField label="Package name" value={s("name")} onChange={(v) => set("name", v)} />
            <TextField label="Audience" value={s("audience")} onChange={(v) => set("audience", v)} />
            <TextField label="Starting price" value={s("startingPrice")} onChange={(v) => set("startingPrice", v)} />
            <ListField label="Included features" value={arr("features")} onChange={(v) => set("features", v)} />
            <TextField label="CTA text" value={s("ctaText")} onChange={(v) => set("ctaText", v)} />
            <BoolField label="Highlight this package" value={d.highlighted === true} onChange={(v) => set("highlighted", v)} />
          </>
        );
      case "projects":
        return (
          <>
            <TextField label="Title" value={s("title")} onChange={(v) => set("title", v)} />
            <TextField label="Category" value={s("category")} onChange={(v) => set("category", v)} />
            <TextField label="Short description" value={s("shortDescription")} onChange={(v) => set("shortDescription", v)} />
            <TextAreaField label="Full description" value={s("description")} onChange={(v) => set("description", v)} rows={3} />
            <ListField label="Technologies" value={arr("technologies")} onChange={(v) => set("technologies", v)} />
            <ListField label="Key features" value={arr("features")} onChange={(v) => set("features", v)} />
            <ListField label="Image URLs" value={arr("images")} onChange={(v) => set("images", v)} hint="Paste image URLs, or upload from the project editor after saving." />
            <BoolField label="Mark as sample concept" value={d.isSample === true} onChange={(v) => set("isSample", v)} hint="Keeps the honest 'sample' badge on the public site." />
            <CaseStudyFields d={d} set={set} />
          </>
        );
      case "process":
      case "benefits":
        return (
          <>
            <TextField label="Title" value={s("title")} onChange={(v) => set("title", v)} />
            <TextAreaField label="Description" value={s("description")} onChange={(v) => set("description", v)} rows={3} />
          </>
        );
      case "testimonials":
        return (
          <>
            <TextField label="Name" value={s("name")} onChange={(v) => set("name", v)} />
            <TextField label="Role" value={s("role")} onChange={(v) => set("role", v)} />
            <TextField label="Company" value={s("company")} onChange={(v) => set("company", v)} />
            <TextAreaField label="Message" value={s("message")} onChange={(v) => set("message", v)} rows={4} />
            <ImageField label="Photo" value={s("photo")} onChange={(v) => set("photo", v)} />
            <BoolField label="Mark as sample" value={d.isSample === true} onChange={(v) => set("isSample", v)} hint="Only uncheck when this is a real, permission-granted testimonial." />
          </>
        );
      case "faqs":
        return (
          <>
            <TextField label="Question" value={s("question")} onChange={(v) => set("question", v)} />
            <TextAreaField label="Answer" value={s("answer")} onChange={(v) => set("answer", v)} rows={4} />
          </>
        );
      case "socials":
        return (
          <>
            <TextField label="Label" value={s("label")} onChange={(v) => set("label", v)} hint="e.g. GitHub, LinkedIn" />
            <TextField label="URL" value={s("url")} onChange={(v) => set("url", v)} hint="Leave empty to hide this link on the public site." />
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="space-y-4">
      {fields}
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-primary" disabled={busy} onClick={() => onSave(d)}>{busy ? "Saving…" : "Save"}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function CaseStudyFields({ d, set }: { d: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const cs = (d.caseStudy && typeof d.caseStudy === "object" ? d.caseStudy : {}) as Record<string, unknown>;
  const setCs = (k: string, v: unknown) => set("caseStudy", { ...cs, [k]: v });
  const s = (k: string) => String(cs[k] ?? "");
  const arr = (k: string) => (Array.isArray(cs[k]) ? (cs[k] as string[]) : []);
  return (
    <details className="rounded-xl border border-ink-200 p-4 dark:border-ink-800">
      <summary className="cursor-pointer text-sm font-semibold text-ink-700 dark:text-ink-200">Case study content</summary>
      <div className="mt-4 space-y-4">
        <TextAreaField label="Project overview" value={s("overview")} onChange={(v) => setCs("overview", v)} rows={2} />
        <TextField label="Client / project type" value={s("clientType")} onChange={(v) => setCs("clientType", v)} />
        <TextAreaField label="Challenge" value={s("challenge")} onChange={(v) => setCs("challenge", v)} rows={2} />
        <TextAreaField label="Proposed solution" value={s("solution")} onChange={(v) => setCs("solution", v)} rows={2} />
        <ListField label="Features delivered" value={arr("featuresDelivered")} onChange={(v) => setCs("featuresDelivered", v)} />
        <ListField label="Technology stack" value={arr("techStack")} onChange={(v) => setCs("techStack", v)} />
        <TextAreaField label="Development process" value={s("process")} onChange={(v) => setCs("process", v)} rows={2} />
        <TextAreaField label="Results" value={s("results")} onChange={(v) => setCs("results", v)} rows={2} hint="Use non-fabricated wording — do not invent statistics." />
      </div>
    </details>
  );
}


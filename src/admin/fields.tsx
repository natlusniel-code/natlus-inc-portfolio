import { useRef, useState } from "react";
import { uploadImage } from "./api";

export function TextField({ label, value, onChange, placeholder, hint, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; type?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input type={type} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function TextAreaField({ label, value, onChange, rows = 4, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea rows={rows} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function ListField({ label, value, onChange, hint, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center gap-2">
            <input
              className="input"
              value={item}
              onChange={(e) => {
                const next = [...value];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="shrink-0 rounded-lg border border-ink-300 px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-ink-700 dark:hover:bg-red-950/30" aria-label={`Remove ${item}`}>
              ✕
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input className="input" value={draft} placeholder={placeholder ?? "Add an item…"} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
          <button type="button" onClick={add} className="btn-secondary shrink-0">Add</button>
        </div>
      </div>
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </div>
  );
}

export function ImageField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (file: File) => {
    setErr("");
    if (file.size > 2_400_000) {
      setErr("Image is too large (max 2.4 MB).");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("Could not read the file."));
        r.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-ink-200 object-cover dark:border-ink-700" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-ink-300 text-xs text-ink-400 dark:border-ink-700">none</span>
        )}
        <div className="flex-1 space-y-2">
          <input className="input" value={value} placeholder="Paste an image URL, or upload below" onChange={(e) => onChange(e.target.value)} />
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void pick(f); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-xs" disabled={busy}>
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {value && <button type="button" onClick={() => onChange("")} className="text-xs text-red-600 hover:underline dark:text-red-400">Clear</button>}
          </div>
          {err && <p className="text-xs text-red-600 dark:text-red-400">{err}</p>}
        </div>
      </div>
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-ink-300 dark:border-ink-700" aria-label={label} />
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#4f46e5" />
      </div>
    </label>
  );
}

export function SelectField({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function BoolField({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500 dark:border-ink-600" />
      <span>
        <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</span>
        {hint && <span className="block text-xs text-ink-400">{hint}</span>}
      </span>
    </label>
  );
}

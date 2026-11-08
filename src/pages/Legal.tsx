import { Link } from "react-router-dom";
import type { ContentBundle } from "../../shared/types";

export function LegalPage({ bundle, kind }: { bundle: ContentBundle; kind: "privacy" | "terms" }) {
  const { footer } = bundle;
  const title = kind === "privacy" ? "Privacy Policy" : "Terms of Service";
  const body = kind === "privacy" ? footer.privacyPolicy : footer.termsOfService;
  return (
    <div className="section-shell py-16 lg:py-20">
      <p className="mb-2 text-sm font-semibold text-brand-600 dark:text-brand-400"><Link to="/" className="hover:underline">← Back to home</Link></p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">{title}</h1>
      <div className="card mt-6 max-w-3xl p-6 whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">{body}</div>
    </div>
  );
}

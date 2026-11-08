import { Link, useParams } from "react-router-dom";
import type { ContentBundle } from "../../shared/types";
import { openWaModal } from "../components/WhatsAppFlow";

export default function CaseStudy({ bundle }: { bundle: ContentBundle }) {
  const { slug } = useParams<{ slug: string }>();
  const project = bundle.projects.find((p) => p.slug === slug);
  if (!project) {
    return (
      <div className="section-shell py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">Case study not found</h1>
        <p className="mt-2 text-ink-500 dark:text-ink-300">This project may have been removed.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    );
  }
  const cs = project.caseStudy;
  const sections: Array<[string, string]> = [
    ["Project overview", cs.overview],
    ["Client / project type", cs.clientType],
    ["Challenge", cs.challenge],
    ["Proposed solution", cs.solution],
    ["Development process", cs.process],
    ["Results", cs.results],
  ];

  return (
    <article className="section-shell py-16 lg:py-20">
      <p className="mb-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
        <Link to="/#portfolio" className="hover:underline">← Portfolio</Link>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{project.category}</span>
        {project.isSample && <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">sample concept</span>}
      </div>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white">{project.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-500 dark:text-ink-300">{project.description}</p>

      {project.images.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {project.images.map((img, i) => (
            <img key={i} src={img} alt={`${project.title} — image ${i + 1}`} loading="lazy" className="rounded-2xl border border-ink-200 object-cover dark:border-ink-800" />
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {sections.map(([t, body]) => body ? (
            <section key={t} className="card p-6">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">{t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{body}</p>
            </section>
          ) : null)}
          {(cs.featuresDelivered.length > 0 || cs.techStack.length > 0) && (
            <section className="card p-6">
              {cs.featuresDelivered.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-ink-900 dark:text-white">Features delivered</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {cs.featuresDelivered.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {cs.techStack.length > 0 && (
                <>
                  <h2 className="mt-6 text-lg font-bold text-ink-900 dark:text-white">Technology stack</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cs.techStack.map((t) => (
                      <span key={t} className="rounded-lg bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">{t}</span>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Want something similar?</h2>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">Tell us your name and we'll open WhatsApp with a message about building a project like {project.title}.</p>
            <button type="button" onClick={() => openWaModal({ kind: "project", label: project.title })} className="btn-primary mt-4 w-full">Request Something Similar</button>
            <button type="button" onClick={() => openWaModal({ kind: "general", label: "" })} className="btn-whatsapp mt-2 w-full">General enquiry</button>
          </div>
        </aside>
      </div>
    </article>
  );
}

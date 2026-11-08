import type { ContentBundle } from "../../shared/types";

export function SectionHeading({ eyebrow, title, sub, alignLeft = false }: { eyebrow?: string; title: string; sub?: string; alignLeft?: boolean }) {
  return (
    <div className={`mb-12 max-w-2xl ${alignLeft ? "text-left" : "mx-auto text-center"}`}>
      {eyebrow && <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {sub && <p className={`section-sub ${alignLeft ? "" : "mx-auto"}`}>{sub}</p>}
    </div>
  );
}

export function HeroSection({ hero, companyName }: { hero: ContentBundle["hero"]; companyName: string }) {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-ink-900 dark:via-ink-950 dark:to-ink-950">
      <div className="section-shell grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-ink-700 dark:bg-ink-900 dark:text-brand-300">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {companyName} — accepting new projects
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl dark:text-white">{hero.headline}</h1>
          <p className="mt-5 text-lg text-ink-600 dark:text-ink-300">{hero.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={hero.ctaPrimaryLink} onClick={(e) => { if (hero.ctaPrimaryLink.startsWith("#")) e.preventDefault(); document.querySelector(hero.ctaPrimaryLink)?.scrollIntoView({ behavior: "smooth" }); }} className="btn-primary">
              {hero.ctaPrimaryText}
            </a>
            <a href={hero.ctaSecondaryLink} onClick={(e) => { if (hero.ctaSecondaryLink.startsWith("#")) e.preventDefault(); document.querySelector(hero.ctaSecondaryLink)?.scrollIntoView({ behavior: "smooth" }); }} className="btn-secondary">
              {hero.ctaSecondaryText}
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-2">
            {(hero.trustIndicators.length ? hero.trustIndicators : ["Web Development", "Mobile Apps", "UI/UX Design", "Business Automation"]).map((t) => (
              <li key={t} className="chip border border-ink-200 bg-white text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200">
                <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden lg:block animate-fade-up" aria-hidden="true">
      <div className="rounded-2xl border border-ink-200 bg-white shadow-card-hover dark:border-ink-800 dark:bg-ink-900 overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-4 py-3 dark:border-ink-800 dark:bg-ink-950">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs font-medium text-ink-400 dark:bg-ink-900">natlus.app</span>
        </div>
        <div className="grid grid-cols-3 gap-3 p-5">
          <div className="col-span-2 space-y-2">
            <div className="h-3 w-2/3 rounded bg-brand-200 dark:bg-brand-800" />
            <div className="h-3 w-full rounded bg-ink-100 dark:bg-ink-800" />
            <div className="h-3 w-5/6 rounded bg-ink-100 dark:bg-ink-800" />
            <div className="h-3 w-3/4 rounded bg-ink-100 dark:bg-ink-800" />
          </div>
          <div className="space-y-2 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
            <div className="h-8 w-8 rounded-lg bg-brand-500/20" />
            <div className="h-3 w-full rounded bg-ink-100 dark:bg-ink-800" />
            <div className="h-3 w-2/3 rounded bg-ink-100 dark:bg-ink-800" />
          </div>
          <div className="col-span-1 space-y-2">
            <div className="h-3 w-full rounded bg-ink-100 dark:bg-ink-800" />
            <div className="h-3 w-full rounded bg-ink-100 dark:bg-ink-800" />
          </div>
          <div className="col-span-1 h-10 rounded-xl bg-brand-600" />
          <div className="col-span-1 h-10 rounded-xl border border-ink-200 dark:border-ink-700" />
        </div>
      </div>
      <div className="absolute -right-4 -top-4 rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-card-hover dark:border-ink-800 dark:bg-ink-900">
        <p className="text-xs font-semibold text-ink-500 dark:text-ink-300">Web Development</p>
        <p className="text-sm font-extrabold text-brand-600 dark:text-brand-400">from NGN 150,000</p>
      </div>
      <div className="absolute -bottom-5 -left-4 rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-card-hover dark:border-ink-800 dark:bg-ink-900">
        <p className="text-xs font-semibold text-ink-500 dark:text-ink-300">Mobile Apps</p>
        <p className="text-sm font-extrabold text-green-600 dark:text-green-400">from NGN 500,000</p>
      </div>
    </div>
  );
}

export function scrollToHash(hash: string) {
  if (hash && hash.startsWith("#")) {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
}

import { useState } from "react";
import { Link } from "react-router-dom";
import type { ContentBundle } from "../../shared/types";
import { SectionHeading, HeroSection } from "../components/Sections";
import { openWaModal } from "../components/WhatsAppFlow";
import { Logo } from "../components/Logo";

export default function Home({ bundle }: { bundle: ContentBundle }) {
  const { company, ceo, hero, contact, pricing, portfolioCategories, services, packages, projects, process, benefits, testimonials, faqs } = bundle;

  return (
    <>
      <HeroSection hero={hero} companyName={company.companyName} />

      {/* About */}
      <section id="about" className="section-shell py-20 lg:py-24">
        <SectionHeading eyebrow="About" title="Software development you can rely on" sub={company.description || "Natlus Inc. is a software development company focused on creating practical digital products that help businesses operate better."} />
        <div className="grid gap-10 lg:grid-cols-2">
          <AboutCard company={company} ceo={ceo} />
          <MissionVision company={company} />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-ink-50/60 py-20 lg:py-24 dark:bg-ink-900/40">
        <div className="section-shell">
          <SectionHeading eyebrow="Services" title="What we build" sub="Every service starts from a clear discussion of your goals. Prices below are starting estimates — final pricing depends on scope and complexity." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article key={s.id} className="card card-hover flex flex-col p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-900/40">{s.icon}</div>
                <h3 className="text-lg font-bold text-ink-900 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{s.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {s.deliverables.slice(0, 6).map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{s.startingPrice}</p>
                  <button type="button" onClick={() => openWaModal({ kind: "service", label: s.title, price: s.startingPrice })} className="btn-secondary mt-3 w-full">
                    Request This Service
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-shell py-20 lg:py-24">
        <SectionHeading eyebrow="Pricing" title="Simple starting packages" sub="Final pricing depends on project scope, features, integrations, timeline, and complexity. Request a consultation for an accurate quote." />
        <div className="grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <article key={p.id} className={`card relative flex flex-col p-7 ${p.highlighted ? "border-brand-500 ring-2 ring-brand-500/30" : ""}`}>
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">Most popular</span>
              )}
              <h3 className="text-xl font-bold text-ink-900 dark:text-white">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{p.audience}</p>
              <p className="mt-4 text-2xl font-extrabold text-brand-600 dark:text-brand-400">{p.startingPrice}</p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => openWaModal({ kind: "package", label: p.name, price: p.startingPrice })} className={`${p.highlighted ? "btn-primary" : "btn-secondary"} mt-7 w-full`}>
                {p.ctaText}
              </button>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {pricing.note}
        </p>
      </section>

      {/* Portfolio */}
      <PortfolioSection categories={portfolioCategories} projects={projects} />

      {/* Process */}
      <section id="process" className="bg-ink-50/60 py-20 lg:py-24 dark:bg-ink-900/40">
        <div className="section-shell">
          <SectionHeading eyebrow="Process" title="How we work" sub="A proven seven-step path from first conversation to launch and beyond." />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <li key={p.id} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-bold text-ink-900 dark:text-white">{p.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{p.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why choose us */}
      <section id="why" className="section-shell py-20 lg:py-24">
        <SectionHeading eyebrow="Why Natlus Inc." title="Why choose us" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <article key={b.id} className="card card-hover p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/40">
                <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-ink-900 dark:text-white">{b.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{b.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-ink-50/60 py-20 lg:py-24 dark:bg-ink-900/40">
        <div className="section-shell">
          <SectionHeading eyebrow="Testimonials" title="What clients say" />
          {testimonials.every((t) => t.isSample) && (
            <p className="mx-auto -mt-6 mb-8 max-w-xl text-center text-sm text-ink-400 dark:text-ink-400">
              These are editable placeholder testimonials. Real client words can be added from the admin panel.
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.id} className="card p-6">
                <div className="mb-3 flex text-amber-400" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.06 9.385c-.783-.57-.38-1.81.589-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm text-ink-600 dark:text-ink-300">“{t.message}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                      {t.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-bold text-ink-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      {t.role}{t.company ? `, ${t.company}` : ""}
                      {t.isSample && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">sample</span>}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-shell py-20 lg:py-24">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f) => (
            <FaqItem key={f.id} q={f.question} a={f.answer} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-ink-50/60 py-20 lg:py-24 dark:bg-ink-900/40">
        <div className="section-shell grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Contact" title="Let's talk about your project" sub={contact.availabilityMessage || "We usually reply within one business day."} alignLeft />
            <ul className="space-y-4 text-sm">
              <li><span className="font-semibold text-ink-900 dark:text-white">Email:</span> <a className="text-brand-600 hover:underline dark:text-brand-400" href={`mailto:${contact.email}`}>{contact.email}</a></li>
              <li><span className="font-semibold text-ink-900 dark:text-white">Phone:</span> <a className="text-brand-600 hover:underline dark:text-brand-400" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a></li>
              {contact.address && <li><span className="font-semibold text-ink-900 dark:text-white">Location:</span> {contact.address}</li>}
              {contact.businessHours && <li><span className="font-semibold text-ink-900 dark:text-white">Hours:</span> {contact.businessHours}</li>}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => openWaModal({ kind: "general", label: "" })} className="btn-whatsapp">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.88-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.04-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.08.15.13.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.39-.45.52-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.3.15.48.13.66-.08.18-.2.76-.88.96-1.19.2-.3.4-.25.68-.15.28.1 1.78.84 2.08.99.3.15.5.23.58.35.07.13.07.73-.18 1.43z" /></svg>
                Chat on WhatsApp
              </button>
              <a className="btn-secondary" href={`mailto:${contact.email}`}>Email us</a>
            </div>
            <p className="mt-6 text-xs text-ink-400">
              We only use your details to respond to your enquiry. We never share your information.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-950"
        aria-label="Chat with Natlus Inc. on WhatsApp"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.88-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.04-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.08.15.13.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.39-.45.52-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.46 1.51.3.15.48.13.66-.08.18-.2.76-.88.96-1.19.2-.3.4-.25.68-.15.28.1 1.78.84 2.08.99.3.15.5.23.58.35.07.13.07.73-.18 1.43z" /></svg>
      </a>

      {/* Footer */}
      <SiteFooter bundle={bundle} />
    </>
  );
}

function AboutCard({ company, ceo }: { company: ContentBundle["company"]; ceo: ContentBundle["ceo"] }) {
  return (
    <div className="card p-7">
      <h3 className="text-xl font-bold text-ink-900 dark:text-white">About {company.companyName}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{company.description}</p>
      <div className="mt-6 flex items-start gap-4 rounded-xl bg-ink-50 p-4 dark:bg-ink-800/60">
        {ceo.photo ? (
          <img src={ceo.photo} alt={ceo.name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-extrabold text-white">
            {ceo.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="font-bold text-ink-900 dark:text-white">{ceo.name}</p>
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{ceo.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-500 dark:text-ink-300">{ceo.bio}</p>
        </div>
      </div>
    </div>
  );
}

function MissionVision({ company }: { company: ContentBundle["company"] }) {
  const items = [
    { title: "Mission", body: company.mission },
    { title: "Vision", body: company.vision },
  ];
  return (
    <div className="flex flex-col gap-6">
      {items.map((x) => (
        <div key={x.title} className="card p-7">
          <h3 className="text-lg font-bold text-ink-900 dark:text-white">{x.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{x.body}</p>
        </div>
      ))}
      <div className="card p-7">
        <h3 className="text-lg font-bold text-ink-900 dark:text-white">Core values</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {company.coreValues.map((v) => (
            <li key={v} className="chip border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-300">{v}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
          We believe in strong communication and honest planning — that's why every project starts with understanding your goals, and ends with a product you can rely on.
        </p>
      </div>
    </div>
  );
}

function PortfolioSection({ categories, projects }: { categories: string[]; projects: ContentBundle["projects"] }) {
  const [active, setActive] = useState("All");
  const cats = ["All", ...categories];
  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);
  return (
    <section id="portfolio" className="section-shell py-20 lg:py-24">
      <SectionHeading eyebrow="Portfolio" title="Selected work" sub="A selection of sample projects demonstrating the range of what we build. Real case studies replace these from the admin panel." />
      <div className="mb-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter projects by category">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={active === c} onClick={() => setActive(c)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active === c ? "bg-brand-600 text-white" : "border border-ink-200 text-ink-600 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article key={p.id} className="card card-hover flex flex-col overflow-hidden">
            {p.images[0] ? (
              <img src={p.images[0]} alt={p.title} loading="lazy" className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-ink-800 dark:to-ink-900">
                <span className="text-5xl">🖥️</span>
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2">
                <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{p.category}</span>
                {p.isSample && <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">sample</span>}
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink-900 dark:text-white">{p.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{p.shortDescription}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.technologies.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300">{t}</span>
                ))}
              </div>
              <div className="mt-auto flex gap-2 pt-5">
                <Link to={`/case-studies/${p.slug}`} className="btn-secondary flex-1 text-xs sm:text-sm">View Case Study</Link>
                <button type="button" onClick={() => openWaModal({ kind: "project", label: p.title })} className="btn-primary flex-1 text-xs sm:text-sm">Request Similar</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <span className="font-semibold text-ink-900 dark:text-white">{q}</span>
        <svg className={`h-5 w-5 shrink-0 text-brand-600 transition-transform dark:text-brand-400 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-ink-100 px-5 py-4 text-sm leading-relaxed text-ink-600 dark:border-ink-800 dark:text-ink-300 animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", service: "", budget: "", description: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setErrorMsg("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErrorMsg("Please enter a valid email address.");
    if (!form.description.trim()) return setErrorMsg("Please describe your project.");
    setErrorMsg("");
    setState("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const ct = res.headers.get("content-type") ?? "";
      const body = ct.includes("application/json") ? await res.json() : null;
      if (!res.ok) throw new Error(body?.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (state === "done") {
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">✓</span>
        <h3 className="mt-4 text-lg font-bold text-ink-900 dark:text-white">Enquiry received</h3>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
          Thank you! Your message has been received and we'll get back to you at {form.email} shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-7 space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="label">Name *</label>
          <input id="cf-name" className="input" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="cf-email" className="label">Email *</label>
          <input id="cf-email" type="email" className="input" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-service" className="label">Service</label>
          <select id="cf-service" className="input" value={form.service} onChange={set("service")}>
            <option value="">Select a service (optional)</option>
            <option>Website Development</option>
            <option>Web Application Development</option>
            <option>Mobile App Development</option>
            <option>UI/UX Design</option>
            <option>E-commerce Solutions</option>
            <option>Custom Software Development</option>
            <option>API and Backend Development</option>
            <option>Website Maintenance and Support</option>
            <option>SEO and Website Optimization</option>
            <option>Cloud Deployment and DevOps</option>
            <option>Software Consulting</option>
            <option>Training and Mentorship</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="cf-budget" className="label">Budget range</label>
          <select id="cf-budget" className="input" value={form.budget} onChange={set("budget")}>
            <option value="">Select budget (optional)</option>
            <option>Under NGN 150,000</option>
            <option>NGN 150,000 – 350,000</option>
            <option>NGN 350,000 – 500,000</option>
            <option>Above NGN 500,000</option>
            <option>Not sure yet</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cf-desc" className="label">Project description *</label>
        <textarea id="cf-desc" rows={4} className="input" value={form.description} onChange={set("description")} placeholder="Tell us briefly about your project…" />
      </div>
      {errorMsg && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{errorMsg}</p>}
      <button type="submit" className="btn-primary w-full" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      <p className="text-center text-xs text-ink-400">Your message is stored securely and only used to respond to your enquiry.</p>
    </form>
  );
}

function SiteFooter({ bundle }: { bundle: ContentBundle }) {
  const { company, contact, footer, socials } = bundle;
  return (
    <footer className="border-t border-ink-200 bg-ink-950 text-ink-300 dark:border-ink-800">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo src={company.logoImage} />
            <span className="text-lg font-extrabold text-white">{company.companyName}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-400">{footer.description}</p>
        </div>
        <nav aria-label="Footer">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            {[["About", "/#about"], ["Services", "/#services"], ["Portfolio", "/#portfolio"], ["Process", "/#process"], ["Pricing", "/#pricing"], ["Contact", "/#contact"]].map(([label, href]) => (
              <li key={label}><a href={href} className="text-ink-400 transition-colors hover:text-white">{label}</a></li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="space-y-2 text-sm">
            {bundle.services.slice(0, 6).map((s) => (
              <li key={s.id}><a href="/#services" className="text-ink-400 transition-colors hover:text-white">{s.title}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="space-y-2 text-sm text-ink-400">
            <li><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>
            <li><a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{contact.phone}</a></li>
            {contact.address && <li>{contact.address}</li>}
            <li className="pt-2">
              <a href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="section-shell flex flex-col items-center justify-between gap-4 py-6 text-xs text-ink-500 sm:flex-row">
          <p>{footer.copyright}</p>
          <div className="flex items-center gap-4">
            {socials.filter((s) => s.url).map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.label}</a>
            ))}
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



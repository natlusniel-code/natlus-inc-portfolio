import { useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { useContent } from "./lib/useContent";
import { useSeo } from "./lib/seo";
import { Navbar } from "./components/Navbar";
import { WhatsAppModal } from "./components/WhatsAppModal";
import Home from "./pages/Home";
import CaseStudy from "./pages/CaseStudy";
import { LegalPage } from "./pages/Legal";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="section-shell py-24 text-center">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-ink-500 dark:text-ink-300">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
    </div>
  );
}

export default function App() {
  const { bundle, error, loading } = useContent();
  useSeo(bundle);

  // Apply admin-selected theme default + primary color as soon as available.
  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    document.documentElement.style.setProperty("--brand-hex", s.primaryColor);
    const stored = localStorage.getItem("natlus-theme");
    if (!stored) {
      document.documentElement.classList.toggle("dark", s.themeDefault === "dark");
    }
  }, [bundle]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-ink-950">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950" role="img" aria-label="Natlus Inc. logo">
          <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
        </div>
        <p className="mt-4 text-sm text-ink-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-ink-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950" role="img" aria-label="Natlus Inc. logo">
          <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
        </div>
        <div className="mt-6 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
          <h1 className="text-lg font-bold text-red-700 dark:text-red-300">Content isn't available right now</h1>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
          <p className="mt-3 text-xs text-red-500 dark:text-red-400">
            If you just deployed: run <code className="rounded bg-red-100 px-1 dark:bg-red-900">npm run db:migrate</code> and <code className="rounded bg-red-100 px-1 dark:bg-red-900">npm run db:seed</code> against the production DATABASE_URL, then reload.
          </p>
        </div>
        <button type="button" onClick={() => location.reload()} className="btn-primary mt-6">Try again</button>
      </div>
    );
  }

  if (!bundle) return null;

  return (
    <>
      <ScrollToTop />
      <Navbar logoImage={bundle.company.logoImage} companyName={bundle.company.companyName} />
      <main>
        <Routes>
          <Route path="/" element={<Home bundle={bundle} />} />
          <Route path="/case-studies/:slug" element={<CaseStudy bundle={bundle} />} />
          <Route path="/privacy" element={<LegalPage bundle={bundle} kind="privacy" />} />
          <Route path="/terms" element={<LegalPage bundle={bundle} kind="terms" />} />
          <Route path="*" element={<NotFound />} />
          {/* /natlus is deliberately NOT routed here — it is a separate standalone
              admin entry (src/admin/main.tsx) mounted at /natlus/index.html. */}
        </Routes>
      </main>
      <WhatsAppModal templates={bundle.whatsapp} whatsappNumber={bundle.contact.whatsappNumber} />
    </>
  );
}

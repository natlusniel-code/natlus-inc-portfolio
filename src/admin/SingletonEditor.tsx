import { useState } from "react";
import type { ContentBundle, ContentKey } from "../../shared/types";
import { saveSingleton } from "./api";
import { BoolField, ColorField, ImageField, ListField, SelectField, TextAreaField, TextField } from "./fields";

type Toast = (kind: "ok" | "err", msg: string) => void;

export function SingletonEditor({ which, bundle, onSaved, toast }: { which: ContentKey; bundle: ContentBundle; onSaved: () => void; toast: Toast }) {
  const [saving, setSaving] = useState(false);

  // Local drafts, seeded from the bundle.
  const [company, setCompany] = useState(bundle.company);
  const [ceo, setCeo] = useState(bundle.ceo);
  const [hero, setHero] = useState(bundle.hero);
  const [contact, setContact] = useState(bundle.contact);
  const [whatsapp, setWhatsapp] = useState(bundle.whatsapp);
  const [footer, setFooter] = useState(bundle.footer);
  const [seo, setSeo] = useState(bundle.seo);
  const [settings, setSettings] = useState(bundle.settings);
  const [pricing, setPricing] = useState(bundle.pricing);
  const [cats, setCats] = useState(bundle.portfolioCategories);

  const valueFor = (): unknown => {
    switch (which) {
      case "company": return company;
      case "ceo": return ceo;
      case "hero": return hero;
      case "contact": return contact;
      case "whatsapp": return whatsapp;
      case "footer": return footer;
      case "seo": return seo;
      case "settings": return settings;
      case "pricing": return pricing;
      case "portfolioCategories": return cats;
      default: return null;
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveSingleton(which, valueFor());
      toast("ok", "Saved. The public site is updated.");
      onSaved();
    } catch (e) {
      toast("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const body = (() => {
    switch (which) {
      case "company":
        return (
          <>
            <TextField label="Company name" value={company.companyName} onChange={(v) => setCompany({ ...company, companyName: v })} />
            <TextField label="Tagline" value={company.tagline} onChange={(v) => setCompany({ ...company, tagline: v })} />
            <TextAreaField label="Description" value={company.description} onChange={(v) => setCompany({ ...company, description: v })} />
            <TextAreaField label="Mission" value={company.mission} onChange={(v) => setCompany({ ...company, mission: v })} />
            <TextAreaField label="Vision" value={company.vision} onChange={(v) => setCompany({ ...company, vision: v })} />
            <ListField label="Core values" value={company.coreValues} onChange={(v) => setCompany({ ...company, coreValues: v })} />
            <ImageField label="Logo image" value={company.logoImage} onChange={(v) => setCompany({ ...company, logoImage: v })} hint="Leave empty to use the built-in Natlus logo on a dark chip." />
            <BoolField label="Show logo on a dark chip" value={company.logoDarkChip} onChange={(v) => setCompany({ ...company, logoDarkChip: v })} hint="Recommended while the logo is white-on-black." />
          </>
        );
      case "ceo":
        return (
          <>
            <TextField label="Name" value={ceo.name} onChange={(v) => setCeo({ ...ceo, name: v })} />
            <TextField label="Title" value={ceo.title} onChange={(v) => setCeo({ ...ceo, title: v })} />
            <TextAreaField label="Bio" value={ceo.bio} onChange={(v) => setCeo({ ...ceo, bio: v })} rows={5} />
            <ImageField label="Photo" value={ceo.photo} onChange={(v) => setCeo({ ...ceo, photo: v })} hint="Leave empty to show an initials placeholder." />
          </>
        );
      case "hero":
        return (
          <>
            <TextField label="Headline" value={hero.headline} onChange={(v) => setHero({ ...hero, headline: v })} />
            <TextAreaField label="Subheadline" value={hero.subheadline} onChange={(v) => setHero({ ...hero, subheadline: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Primary CTA text" value={hero.ctaPrimaryText} onChange={(v) => setHero({ ...hero, ctaPrimaryText: v })} />
              <TextField label="Primary CTA link" value={hero.ctaPrimaryLink} onChange={(v) => setHero({ ...hero, ctaPrimaryLink: v })} hint="e.g. #services" />
              <TextField label="Secondary CTA text" value={hero.ctaSecondaryText} onChange={(v) => setHero({ ...hero, ctaSecondaryText: v })} />
              <TextField label="Secondary CTA link" value={hero.ctaSecondaryLink} onChange={(v) => setHero({ ...hero, ctaSecondaryLink: v })} hint="e.g. #portfolio" />
            </div>
            <ImageField label="Hero image" value={hero.heroImage} onChange={(v) => setHero({ ...hero, heroImage: v })} hint="Leave empty to use the built-in interface mockup." />
            <ListField label="Trust indicators" value={hero.trustIndicators} onChange={(v) => setHero({ ...hero, trustIndicators: v })} hint="Service-based indicators only — avoid numerical claims." />
          </>
        );
      case "contact":
        return (
          <>
            <TextField label="Email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
            <TextField label="Phone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
            <TextField label="WhatsApp number" value={contact.whatsappNumber} onChange={(v) => setContact({ ...contact, whatsappNumber: v })} hint="Digits only, with country code — e.g. 2349111356510" />
            <TextField label="Address" value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} />
            <TextField label="Business hours" value={contact.businessHours} onChange={(v) => setContact({ ...contact, businessHours: v })} />
            <TextAreaField label="Availability message" value={contact.availabilityMessage} onChange={(v) => setContact({ ...contact, availabilityMessage: v })} rows={3} />
          </>
        );
      case "whatsapp":
        return (
          <>
            <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
              Placeholders: <code className="font-mono">[NAME]</code>, <code className="font-mono">[SELECTED SERVICE]</code>, <code className="font-mono">[PACKAGE NAME]</code>, <code className="font-mono">[PROJECT NAME]</code>, <code className="font-mono">[PRICE]</code>.
            </p>
            <TextAreaField label="Service request template" value={whatsapp.service} onChange={(v) => setWhatsapp({ ...whatsapp, service: v })} rows={4} />
            <TextAreaField label="Pricing package template" value={whatsapp.package} onChange={(v) => setWhatsapp({ ...whatsapp, package: v })} rows={4} />
            <TextAreaField label="Portfolio project template" value={whatsapp.project} onChange={(v) => setWhatsapp({ ...whatsapp, project: v })} rows={4} />
            <TextAreaField label="General enquiry template" value={whatsapp.general} onChange={(v) => setWhatsapp({ ...whatsapp, general: v })} rows={3} />
          </>
        );
      case "footer":
        return (
          <>
            <TextAreaField label="Short company description" value={footer.description} onChange={(v) => setFooter({ ...footer, description: v })} rows={3} />
            <TextField label="Copyright text" value={footer.copyright} onChange={(v) => setFooter({ ...footer, copyright: v })} />
            <TextAreaField label="Privacy policy" value={footer.privacyPolicy} onChange={(v) => setFooter({ ...footer, privacyPolicy: v })} rows={5} />
            <TextAreaField label="Terms of service" value={footer.termsOfService} onChange={(v) => setFooter({ ...footer, termsOfService: v })} rows={5} />
          </>
        );
      case "seo":
        return (
          <>
            <TextField label="Page title" value={seo.title} onChange={(v) => setSeo({ ...seo, title: v })} />
            <TextAreaField label="Meta description" value={seo.description} onChange={(v) => setSeo({ ...seo, description: v })} rows={3} />
            <TextField label="Keywords" value={seo.keywords} onChange={(v) => setSeo({ ...seo, keywords: v })} hint="Comma-separated" />
            <ImageField label="Open Graph image" value={seo.ogImage} onChange={(v) => setSeo({ ...seo, ogImage: v })} />
          </>
        );
      case "settings":
        return (
          <>
            <ColorField label="Primary color" value={settings.primaryColor} onChange={(v) => setSettings({ ...settings, primaryColor: v })} />
            <SelectField label="Font family" value={settings.fontFamily} onChange={(v) => setSettings({ ...settings, fontFamily: v as typeof settings.fontFamily })} options={[{ value: "inter", label: "Inter (modern sans)" }, { value: "system", label: "System default" }, { value: "serif", label: "Serif" }]} />
            <SelectField label="Default theme" value={settings.themeDefault} onChange={(v) => setSettings({ ...settings, themeDefault: v as typeof settings.themeDefault })} options={[{ value: "light", label: "Light (recommended)" }, { value: "dark", label: "Dark" }]} hint="Visitors can still toggle; this is the starting theme." />
          </>
        );
      case "pricing":
        return <TextAreaField label="Pricing note" value={pricing.note} onChange={(v) => setPricing({ note: v })} rows={3} hint="Shown under the pricing packages." />;
      case "portfolioCategories":
        return <ListField label="Portfolio categories" value={cats} onChange={setCats} hint="Used for the portfolio filter buttons." />;
      default:
        return null;
    }
  })();

  return (
    <div className="space-y-5">
      {body}
      <div className="flex items-center gap-3 border-t border-ink-200 pt-5 dark:border-ink-800">
        <button type="button" className="btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <span className="text-xs text-ink-400">Changes appear on the public site immediately.</span>
      </div>
    </div>
  );
}

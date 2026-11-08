import { HttpError } from "./errors.js";
import { bool, isHexColor, requiredStr, slugify, str, strArr } from "./validate.js";
import type { ContentKey, ContentListKey, SingletonValue } from "../../shared/types.js";

type AnyRecord = Record<string, unknown>;

/** Validate and sanitize a singleton content value (stored under `content` key). */
export function validateSingleton(key: ContentKey, raw: unknown): SingletonValue {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new HttpError(400, `Invalid value for "${key}".`);
  }
  const v = raw as AnyRecord;

  switch (key) {
    case "company":
      return {
        companyName: requiredStr(v.companyName, "Company name", 120),
        tagline: str(v.tagline, 240),
        description: str(v.description),
        mission: str(v.mission),
        vision: str(v.vision),
        coreValues: strArr(v.coreValues, 80),
        logoImage: str(v.logoImage, 4000),
        logoDarkChip: bool(v.logoDarkChip),
      };
    case "ceo":
      return {
        name: requiredStr(v.name, "Name", 120),
        title: str(v.title, 120),
        bio: str(v.bio),
        photo: str(v.photo, 4000),
      };
    case "hero":
      return {
        headline: requiredStr(v.headline, "Headline", 160),
        subheadline: str(v.subheadline, 500),
        ctaPrimaryText: requiredStr(v.ctaPrimaryText, "Primary CTA text", 60),
        ctaPrimaryLink: str(v.ctaPrimaryLink, 400),
        ctaSecondaryText: requiredStr(v.ctaSecondaryText, "Secondary CTA text", 60),
        ctaSecondaryLink: str(v.ctaSecondaryLink, 400),
        heroImage: str(v.heroImage, 4000),
        trustIndicators: strArr(v.trustIndicators, 40),
      };
    case "contact":
      return {
        email: requiredStr(v.email, "Email", 200),
        phone: str(v.phone, 60),
        whatsappNumber: requiredStr(v.whatsappNumber, "WhatsApp number", 30).replace(/\D/g, ""),
        address: str(v.address, 400),
        businessHours: str(v.businessHours, 240),
        availabilityMessage: str(v.availabilityMessage, 500),
      };
    case "whatsapp":
      return {
        service: requiredStr(v.service, "Service template", 2000),
        package: requiredStr(v.package, "Package template", 2000),
        project: requiredStr(v.project, "Project template", 2000),
        general: str(v.general, 2000),
      };
    case "footer":
      return {
        description: str(v.description, 1000),
        copyright: requiredStr(v.copyright, "Copyright text", 200),
        privacyPolicy: str(v.privacyPolicy),
        termsOfService: str(v.termsOfService),
      };
    case "seo":
      return {
        title: requiredStr(v.title, "SEO title", 200),
        description: requiredStr(v.description, "Meta description", 400),
        keywords: str(v.keywords, 500),
        ogImage: str(v.ogImage, 4000),
      };
    case "settings": {
      if (!isHexColor(v.primaryColor)) throw new HttpError(400, "Primary color must be a hex value like #4f46e5.");
      const font = str(v.fontFamily, 20);
      if (!["inter", "system", "serif"].includes(font)) throw new HttpError(400, "Font family must be inter, system or serif.");
      const theme = str(v.themeDefault, 10);
      if (!["light", "dark"].includes(theme)) throw new HttpError(400, "themeDefault must be light or dark.");
      return { primaryColor: (v.primaryColor as string).toLowerCase(), fontFamily: font as "inter" | "system" | "serif", themeDefault: theme as "light" | "dark" };
    }
    case "pricing":
      return { note: str(v.note || v.pricingNote, 1000) };
    case "portfolioCategories":
      return strArr(raw, 60);
    default:
      throw new HttpError(400, `Unknown content key "${key}".`);
  }
}

export interface ItemRow {
  id: number;
  data: AnyRecord;
}

function projectPayload(v: AnyRecord) {
  const title = requiredStr(v.title, "Title", 160);
  const cs = (v.caseStudy && typeof v.caseStudy === "object" ? v.caseStudy : {}) as AnyRecord;
  return {
    slug: slugify(str(v.slug, 80) || title),
    title,
    category: requiredStr(v.category, "Category", 120),
    shortDescription: str(v.shortDescription, 400),
    description: str(v.description),
    technologies: strArr(v.technologies, 80),
    features: strArr(v.features, 200),
    images: strArr(v.images, 4000),
    isSample: bool(v.isSample),
    caseStudy: {
      overview: str(cs.overview),
      clientType: str(cs.clientType, 200),
      challenge: str(cs.challenge),
      solution: str(cs.solution),
      featuresDelivered: strArr(cs.featuresDelivered, 200),
      techStack: strArr(cs.techStack, 80),
      process: str(cs.process),
      results: str(cs.results),
    },
  };
}

/** Validate/sanitize an item payload for a given list. */
export function validateItem(list: ContentListKey, raw: unknown): AnyRecord {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new HttpError(400, `Invalid ${list} item.`);
  }
  const v = raw as AnyRecord;
  switch (list) {
    case "services":
      return {
        title: requiredStr(v.title, "Title", 160),
        description: str(v.description),
        deliverables: strArr(v.deliverables, 200),
        startingPrice: requiredStr(v.startingPrice, "Starting price", 120),
        icon: str(v.icon, 200),
      };
    case "packages":
      return {
        name: requiredStr(v.name, "Name", 160),
        audience: str(v.audience, 300),
        startingPrice: requiredStr(v.startingPrice, "Starting price", 120),
        features: strArr(v.features, 200),
        ctaText: str(v.ctaText, 60) || "Request This Package",
        highlighted: bool(v.highlighted),
      };
    case "projects":
      return projectPayload(v);
    case "process":
      return { title: requiredStr(v.title, "Title", 120), description: str(v.description) };
    case "benefits":
      return { title: requiredStr(v.title, "Title", 120), description: str(v.description) };
    case "testimonials":
      return {
        name: requiredStr(v.name, "Name", 120),
        role: str(v.role, 120),
        company: str(v.company, 160),
        message: requiredStr(v.message, "Message"),
        photo: str(v.photo, 4000),
        isSample: bool(v.isSample),
      };
    case "faqs":
      return { question: requiredStr(v.question, "Question", 400), answer: requiredStr(v.answer, "Answer") };
    case "socials": {
      const label = requiredStr(v.label, "Label", 60);
      return { label, url: str(v.url, 1000) };
    }
    default:
      throw new HttpError(400, `Unknown list "${list}".`);
  }
}

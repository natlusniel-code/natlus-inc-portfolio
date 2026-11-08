// Shared content model for the Natlus Inc. portfolio.
// Type-only module — erased at compile time, safe to import from client and API.

export interface CompanySettings {
  companyName: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  coreValues: string[];
  logoImage: string;
  logoDarkChip: boolean;
}

export interface CeoProfile {
  name: string;
  title: string;
  bio: string;
  photo: string; // empty = show placeholder
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string; // "#services" or external
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  heroImage: string; // empty = show built-in CSS mockup
  trustIndicators: string[];
}

export interface Service {
  id: number;
  title: string;
  description: string;
  deliverables: string[];
  startingPrice: string; // display label, e.g. "from NGN 150,000"
  icon: string; // emoji or image URL
}

export interface PricingPackage {
  id: number;
  name: string;
  audience: string;
  startingPrice: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
}

export interface ProjectCaseStudy {
  overview: string;
  clientType: string;
  challenge: string;
  solution: string;
  featuresDelivered: string[];
  techStack: string[];
  process: string;
  results: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  technologies: string[];
  features: string[];
  images: string[];
  isSample: boolean;
  caseStudy: ProjectCaseStudy;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
}

export interface Benefit {
  id: number;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  message: string;
  photo: string;
  isSample: boolean;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsappNumber: string; // digits only, e.g. 2349111356510
  address: string;
  businessHours: string;
  availabilityMessage: string;
}

export interface WhatsAppTemplates {
  service: string;
  package: string;
  project: string;
  general: string;
}

export interface SocialLink {
  id: number;
  label: string;
  url: string; // empty = hidden on the public site
}

export interface FooterContent {
  description: string;
  copyright: string;
  privacyPolicy: string;
  termsOfService: string;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export type ThemeDefault = "light" | "dark";
export type FontChoice = "inter" | "system" | "serif";

export interface SiteSettings {
  primaryColor: string; // hex, e.g. #4f46e5
  fontFamily: FontChoice;
  themeDefault: ThemeDefault;
}

export interface PricingNote {
  note: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  service: string;
  budget: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export type ContentKey =
  | "company"
  | "ceo"
  | "hero"
  | "contact"
  | "whatsapp"
  | "footer"
  | "seo"
  | "settings"
  | "pricing"
  | "portfolioCategories";

export type ContentListKey =
  | "services"
  | "packages"
  | "projects"
  | "process"
  | "benefits"
  | "testimonials"
  | "faqs"
  | "socials";

export type ItemData =
  | Service
  | PricingPackage
  | Project
  | ProcessStep
  | Benefit
  | Testimonial
  | Faq
  | SocialLink;

export interface ContentBundle {
  company: CompanySettings;
  ceo: CeoProfile;
  hero: HeroContent;
  contact: ContactInfo;
  whatsapp: WhatsAppTemplates;
  footer: FooterContent;
  seo: SeoSettings;
  settings: SiteSettings;
  pricing: PricingNote;
  portfolioCategories: string[];
  services: Service[];
  packages: PricingPackage[];
  projects: Project[];
  process: ProcessStep[];
  benefits: Benefit[];
  testimonials: Testimonial[];
  faqs: Faq[];
  socials: SocialLink[];
}

export type SingletonValue =
  | CompanySettings
  | CeoProfile
  | HeroContent
  | ContactInfo
  | WhatsAppTemplates
  | FooterContent
  | SeoSettings
  | SiteSettings
  | PricingNote
  | string[];

export type { Service as ServiceItem, PricingPackage as PackageItem, ProcessStep as ProcessItem, Benefit as BenefitItem, Testimonial as TestimonialItem, Faq as FaqItem, SocialLink as SocialItem, Project as ProjectItem };

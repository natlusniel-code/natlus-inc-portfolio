import { useEffect } from "react";
import type { ContentBundle } from "../../shared/types";

/** Sets a <meta> tag's content, creating it if absent. */
function setMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Applies the admin-editable SEO settings (spec section 22) to the document
 * head, and injects Organization structured data. Runs whenever the content
 * bundle changes, so an admin edit is reflected on the next load.
 */
export function useSeo(bundle: ContentBundle | null) {
  useEffect(() => {
    if (!bundle) return;
    const { seo, company, contact, socials } = bundle;

    const title = seo.title || `${company.companyName} — ${company.tagline}`;
    const description = seo.description || company.description;
    document.title = title;

    setMeta("name", "description", description);
    setMeta("name", "keywords", seo.keywords);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", company.companyName);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", seo.ogImage || company.logoImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", seo.ogImage || company.logoImage);
    setLink("canonical", window.location.origin + "/");

    // Organization structured data (spec section 22).
    const sameAs = socials.map((s) => s.url).filter(Boolean);
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: company.companyName,
      description: company.description,
      url: window.location.origin + "/",
      logo: company.logoImage || undefined,
      email: contact.email || undefined,
      telephone: contact.phone || undefined,
      address: contact.address ? { "@type": "PostalAddress", addressLocality: contact.address } : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    };
    let script = document.getElementById("natlus-structured-data") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "natlus-structured-data";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }, [bundle]);
}

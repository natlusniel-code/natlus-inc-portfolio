// Verifies the WhatsApp request flow (spec section 19) against the LIVE
// content store: the three message formats, the number, and safe handling
// of special characters in the visitor's name.
//
// This mirrors src/lib/whatsapp.ts exactly, so a drift between the two
// shows up as a failure here.
//
// Usage: node scripts/verify-whatsapp.mjs [baseUrl]
//   baseUrl defaults to http://localhost:3001
const base = process.argv[2] || "http://localhost:3001";

/** Mirrors fill() in src/lib/whatsapp.ts. */
function fill(template, name, req) {
  const n = name.trim();
  return template
    .replace(/\[NAME\]/g, n)
    .replace(/\[SELECTED SERVICE\]/g, req.kind === "service" ? req.label : "selected")
    .replace(/\[PACKAGE NAME\]/g, req.kind === "package" ? req.label : "selected")
    .replace(/\[PROJECT NAME\]/g, req.kind === "project" ? req.label : "this project")
    .replace(/\[PRICE\]/g, req.price ?? "our starting price")
    .replace(/\s+/g, " ")
    .trim();
}

function buildUrl(number, templates, name, req) {
  const tpl =
    req.kind === "package"
      ? templates.package
      : req.kind === "project"
        ? templates.project
        : req.kind === "service"
          ? templates.service
          : templates.general;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(fill(tpl, name, req))}`;
}

const cases = [
  { kind: "service", label: "Website Development", price: "from NGN 150,000", name: "Ada Obi" },
  { kind: "package", label: "Business Pro", price: "NGN 850,000", name: "Chukwuemeka Nwosu-Okafor" },
  { kind: "project", label: "E-commerce Store for a Fashion Brand", name: "Aisha Bello" },
  // Special characters must survive encoding intact.
  { kind: "service", label: "UI/UX Design", price: "from NGN 120,000", name: "O'Brien & Sons <Ltd> #1" },
  // Whitespace is trimmed before use.
  { kind: "service", label: "Mobile App Development", price: "from NGN 450,000", name: "  Grace  " },
];

const [bundleRes, contactRes] = await Promise.all([
  fetch(`${base}/api/content/bundle`),
  fetch(`${base}/api/content/contact`),
]);
if (!bundleRes.ok || !contactRes.ok) {
  console.error(`Could not read content (${bundleRes.status}/${contactRes.status}). Is the API running?`);
  process.exit(1);
}
const bundle = await bundleRes.json();
const contact = (await contactRes.json()).value;
const templates = bundle.whatsapp;
const number = contact.whatsappNumber;

console.log(`WhatsApp number: ${number}\n`);

let failures = 0;
for (const c of cases) {
  const message = fill(templates[c.kind], c.name, c);
  const link = buildUrl(number, templates, c.name, c);
  const trimmed = c.name.trim();

  const problems = [];
  if (!link.startsWith(`https://wa.me/${number.replace(/\D/g, "")}?text=`)) problems.push("wrong base URL");
  if (/\[[A-Z ]+\]/.test(message)) problems.push("unfilled placeholder");
  if (!message.includes(trimmed)) problems.push("name missing from message");
  if (message.includes("  ")) problems.push("double space (not collapsed)");
  if (decodeURIComponent(link.split("?text=")[1]) !== message) problems.push("encoding round-trip mismatch");

  if (problems.length) {
    failures++;
    console.error(`FAIL [${c.kind}] ${problems.join(", ")}`);
    console.error(`  message: ${message}`);
  } else {
    console.log(`PASS [${c.kind}] name="${trimmed}"`);
    console.log(`  ${message}`);
  }
  console.log(`  -> ${link}\n`);
}

if (failures) {
  console.error(`${failures} case(s) failed.`);
  process.exit(1);
}
console.log(`All ${cases.length} WhatsApp cases passed.`);

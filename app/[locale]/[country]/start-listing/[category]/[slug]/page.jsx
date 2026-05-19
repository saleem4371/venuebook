import { notFound } from "next/navigation";
import { CATEGORY_LABELS, SLUG_TO_STEP, STEP_TO_SLUG } from "../../components/wizardConfig";
import WizardShell from "../../components/WizardShell";

// ─── Static params ─────────────────────────────────────────────────────────
// Pre-render all category × step slug combinations, plus the bare category
// URL (slug absent) which maps to the basics step.

export function generateStaticParams() {
  const slugs      = Object.values(STEP_TO_SLUG);
  const categories = Object.keys(CATEGORY_LABELS);
  const pairs      = [];

  for (const category of categories) {
    // Bare URL: /start-listing/[category]  (slug = undefined)
    pairs.push({ category, slug: [] });
    // Step URLs: /start-listing/[category]/basic-details, /location, …
    for (const slug of slugs) {
      pairs.push({ category, slug: [slug] });
    }
  }
  return pairs;
}



// ─── Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const label = CATEGORY_LABELS[resolvedParams.category] || "Property";
  return {
    title: `List your ${label} — VenueBook`,
    description: `Create your ${label} listing on VenueBook in just a few steps.`,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────
// Single page file for every step URL — no other page.jsx exists under
// [category], so this [[...slug]] optional catch-all handles them all:
//
//   /start-listing/[category]               → basics (slug absent)
//   /start-listing/[category]/basic-details → basics
//   /start-listing/[category]/location      → location
//   /start-listing/[category]/amenities     → amenities
//   /start-listing/[category]/capacity      → capacity
//   /start-listing/[category]/pricing       → pricing
//   /start-listing/[category]/photos        → photos
//   /start-listing/[category]/review        → review
//
// Because ALL step URLs resolve to this same page file, React never remounts
// WizardShell when navigating between steps (router.push stays within the
// same component tree). All wizard state — attempted fields, animation
// direction, auth flags — persists naturally across steps.
//
// WizardShell reads the slug from useParams() and defaults to "basics" when
// the slug is absent, so visiting the bare category URL works without any
// server-side redirect (browser history entry is preserved correctly).

export default async function StartListingStepPage({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams.category;
  const slugArr   = resolvedParams.slug; // string[] | undefined (optional catch-all)

  // Unknown category → 404
  const validCategory = Object.keys(CATEGORY_LABELS).includes(category)
    ? category
    : null;
  if (!validCategory) notFound();

  // Unknown slug (non-empty but unrecognised) → 404
  const slug = Array.isArray(slugArr) && slugArr.length > 0 ? slugArr[0] : null;
  if (slug && !SLUG_TO_STEP[slug]) notFound();

  // slug === null means bare category URL → WizardShell defaults to basics
  return <WizardShell initialCategory={validCategory} />;
}

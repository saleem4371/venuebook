import { CATEGORY_LABELS } from "../components/wizardConfig";
import WizardShell from "../components/WizardShell";

// ─── Static params for all 6 categories ───────────────────────────────────

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((category) => ({ category }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const label = CATEGORY_LABELS[resolvedParams.category] || "Property";
  return {
    title: `List your ${label} — VenueBook`,
    description: `Create your ${label} listing on VenueBook in just a few steps.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function StartListingPage({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams.category;

  // Fallback to "venue" if category is unknown
  const validCategory = Object.keys(CATEGORY_LABELS).includes(category)
    ? category
    : "venue";

  return <WizardShell initialCategory={validCategory} />;
}

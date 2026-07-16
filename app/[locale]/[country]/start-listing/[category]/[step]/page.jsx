import { notFound } from "next/navigation";

import {
  CATEGORY_LABELS,
  SLUG_TO_STEP,
} from "../../components/wizardConfig";

import WizardShell from "../../components/WizardShell";

export async function generateMetadata({ params }) {
  const { category } = await params;

  const label =
    CATEGORY_LABELS[category] || "Property";

  return {
    title: `List your ${label} — venuebook.in`,
    description: `Create your ${label} listing on venuebook.in in just a few steps.`,
  };
}

export default async function StartListingStepPage({
  params,
}) {
  const { category, step } = await params;

  // validate category
  const validCategory =
    Object.keys(CATEGORY_LABELS).includes(category);

  if (!validCategory) {
    notFound();
  }

  // validate step
  const validStep =
    Object.keys(SLUG_TO_STEP).includes(step);

  if (!validStep) {
    notFound();
  }

  return (
    <WizardShell initialCategory={category} />
  );
}
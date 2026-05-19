import { redirect, notFound } from "next/navigation";
import { CATEGORY_LABELS } from "../components/wizardConfig";

export default async function CategoryPage({ params }) {
  const { category, locale, country } = await params;

  const valid = Object.keys(CATEGORY_LABELS).includes(category);

  if (!valid) {
    notFound();
  }

  redirect(
    `/${locale}/${country}/start-listing/${category}/basic-details`
  );
}
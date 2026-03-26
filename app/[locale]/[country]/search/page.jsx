import { redirect } from "next/navigation";

export default function Page({ params }) {
  const country = params?.country || "in";
  const locale = params?.locale || "en";

  redirect(`/${country}/${locale}/search/venues`);
}
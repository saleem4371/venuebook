import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const { locale, country } = await params;
  const lang   = locale  || "en";
  const region = country || "in";

  redirect(`/${lang}/${region}/home`);
}

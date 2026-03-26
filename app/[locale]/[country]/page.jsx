"use client";
import { getDictionary } from "@/lib/getDictionary";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";

export default async function Page({ params }) {

  const { locale, country } = useParams();
   const lang = locale || "en";
  const region = country || "in";

  redirect(`/${lang}/${region}/home`);

  return null;
}

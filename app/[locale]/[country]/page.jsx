"use client";
import { getDictionary } from "@/lib/getDictionary";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";

export default async function Page({ params }) {

  const { locale, country } = useParams();

  // const { locale } = await params;  // ✅ await params

  // const dict = await getDictionary(locale);

  // return (
  //   <div>
  //     <h1 className="text-2xl font-bold bg-red-500">{dict.title} </h1>
  //     <p>{dict.welcome}</p>
      
  //   </div>
  // );
 // redirect("/import_data/scrape");
   const lang = locale || "en";
  const region = country || "in";

  redirect(`/${lang}/${region}/home`);

  return null;
}

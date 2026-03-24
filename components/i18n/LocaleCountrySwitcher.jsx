"use client";

import { useRouter, usePathname, useParams } from "next/navigation";

export default function LocaleCountrySwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, country } = useParams();

  const changeLocale = (newLocale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const changeCountry = (newCountry) => {
    const segments = pathname.split("/");
    segments[2] = newCountry;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex gap-4">

      {/* Language */}
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="border px-3 py-1 rounded"
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
      </select>

      {/* Country */}
      <select
        value={country}
        onChange={(e) => changeCountry(e.target.value)}
        className="border px-3 py-1 rounded"
      >
        <option value="in">India</option>
        <option value="us">USA</option>
        <option value="ar">UAE</option>
        <option value="sa">Saudi Arabia</option>
      </select>

    </div>
  );
}

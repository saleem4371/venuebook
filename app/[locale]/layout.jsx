import { getDictionary } from "@/lib/getDictionary";
import { DictionaryProvider } from "@/context/DictionaryContext";

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  const dict = await getDictionary(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

return (
  <DictionaryProvider dict={dict}>
    <div dir={dir}>
      {children}
    </div>
  </DictionaryProvider>
);
}

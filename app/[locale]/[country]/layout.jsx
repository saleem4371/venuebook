import { getDictionary } from "@/lib/getDictionary";
import { DictionaryProvider } from "@/context/DictionaryContext";

export default async function LocaleLayout({ children, params }) {

  const { locale } = await params;   // ✅ FIX

  const dict = await getDictionary(locale);

  return (
    <DictionaryProvider dict={dict}>
      {children}
    </DictionaryProvider>
  );
}

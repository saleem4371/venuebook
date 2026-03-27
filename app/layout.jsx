import { getDictionary } from "@/lib/getDictionary";
import ClientLayout from "./ClientLayout";

export default async function LocaleLayout({ children, params }) {
  // If params is a Promise, await it
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const dict = await getDictionary(locale);

  return (
    <ClientLayout dict={dict}>
      {children}
    </ClientLayout>
  );
}
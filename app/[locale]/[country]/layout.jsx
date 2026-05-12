import ClientLayout from "./ClientLayout";

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  return < ClientLayout locale={locale}>{children}</ClientLayout>;
}

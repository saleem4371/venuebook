import { getDictionary } from "@/lib/getDictionary";
import { DictionaryProvider } from "@/context/DictionaryContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  const dict = await getDictionary(locale);

  const dir = 'ltr';//locale === "ar" ? "rtl" : "ltr";

return (
  <DictionaryProvider dict={dict}>
    <div dir={dir}>
        <GoogleOAuthProvider clientId="774185917573-vrjso023g1tjnceasenfrvh7v8qntmho.apps.googleusercontent.com">
 {children}
        </GoogleOAuthProvider>
     
    </div>
  </DictionaryProvider>
);
}

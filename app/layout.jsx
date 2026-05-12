import "./globals.css";
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Arabic,
} from "next/font/google";
import { headers }           from "next/headers";
import { RTL_LOCALES, locales, defaultLocale } from "@/config/i18n";

/* ── Primary: Airbnb-style font for Latin/Latin-ext ── */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/* ── Supplemental: script-specific fonts loaded only when needed ──
   Each font uses `display: swap` so Latin text is never blocked.
   CSS :lang() selectors in globals.css route each locale to the
   correct font-family, preventing system-font metric mismatches
   that cause glyph clipping in Hindi, Kannada, and Arabic.        ── */
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const kannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  variable: "--font-kannada",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "VenueBook",
  description:
    "Discover and book venues, farmstays, studios, workspaces & rentals",
};

export default async function RootLayout({ children }) {
  /*
   * Read the locale our middleware stamps on every valid request:
   *   middleware.js → requestHeaders.set("x-next-intl-locale", seg0)
   *
   * This lets us set the correct lang and dir on <html> at SSR time so
   * the server-rendered HTML is semantically correct for screen readers,
   * crawlers, and browser chrome (e.g. scrollbar placement on Arabic pages).
   *
   * Falls back to defaultLocale when the header is absent (API routes,
   * static assets, etc. — excluded by the middleware matcher).
   */
  const headerLocale = (await headers()).get("x-next-intl-locale");
  const locale = (headerLocale && locales.includes(headerLocale))
    ? headerLocale
    : defaultLocale;
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    /*
     * suppressHydrationWarning — the inline script below sets `dark` class
     * on <html> before hydration, creating an intentional server/client
     * mismatch that is safe and expected.
     *
     * lang and dir are set from the middleware header above (SSR) and kept
     * in sync by HtmlDirSync (client navigation) — no inline script needed
     * for locale attributes.
     */
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={[
        jakarta.variable,
        devanagari.variable,
        kannada.variable,
        arabic.variable,
      ].join(" ")}
    >
      <head>
        {/*
          Theme — runs synchronously before paint for zero flicker.
          Reads ONLY localStorage key 'theme'. No system/OS detection.
        */}

         <script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAzQBQV6-t21jRrYTU9WGOnAO0iz-fpGEI&libraries=places"
          async
          defer
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased font-sans"
      >
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import Script from "next/script";
import { ToastProvider } from "../components/ToastProvider";
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";
import PWABottomSheets from "@/components/PWABottomSheets";
import PWAInstallToast from "@/components/PWAInstallToast";
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Arabic,
} from "next/font/google";
import { headers } from "next/headers";
import { RTL_LOCALES, locales, defaultLocale } from "@/config/i18n";
import { APP_NAME } from "@/config/constants";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: APP_NAME,
  description: "Discover and book venues, farmstays, studios, workspaces & rentals",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/icon-192x192.png" },
    ],
  },
};

export const viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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

export default async function RootLayout({ children }) {
  const headerLocale = (await headers()).get("x-next-intl-locale");
  const locale = headerLocale && locales.includes(headerLocale)
    ? headerLocale
    : defaultLocale;
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAzQBQV6-t21jRrYTU9WGOnAO0iz-fpGEI&libraries=places"
          async
          defer
        ></script>
      </head>

      <body
        suppressHydrationWarning
        className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased font-sans"
      >
        <ServiceWorkerProvider>
          <PWABottomSheets />
          <PWAInstallToast />
          <ToastProvider position="bottom-center">
            {children}
          </ToastProvider>
        </ServiceWorkerProvider>

        <Script id="pwa-install-listener" strategy="beforeInteractive">{`
          window.__pwaInstallEvent = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaInstallEvent = e;
            window.dispatchEvent(new Event('pwa-installable'));
          });
          window.addEventListener('appinstalled', function() {
            window.__pwaInstalled = true;
            window.dispatchEvent(new Event('pwa-installed'));
          });
        `}</Script>
      </body>
    </html>
  );
}

import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

/* ── Airbnb-style font — Plus Jakarta Sans is the closest open match
      to Airbnb Cereal: rounded, modern, highly legible at all sizes  ── */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "VenueBook",
  description: "Discover and book venues, farmstays, studios, workspaces & rentals",
};

export default function RootLayout({ children }) {
  return (
    /*
      suppressHydrationWarning — the inline script below adds the `dark` class
      before hydration, creating an intentional server/client mismatch.
    */
    <html suppressHydrationWarning className={jakarta.variable}>
      <head>
        {/*
          Runs synchronously before any paint — zero flicker.
          Reads ONLY localStorage key 'theme'. No system/OS theme involved.
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
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

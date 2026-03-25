import "./globals.css";
import Script from "next/script";

<Script
  src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAzQBQV6-t21jRrYTU9WGOnAO0iz-fpGEI&libraries=places`}
  strategy="beforeInteractive"
/>

export const metadata = {
  title: "Venue Platform",
  description: "Find and book the best venues",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}

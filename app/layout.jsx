import "./globals.css";

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

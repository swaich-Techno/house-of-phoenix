import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { getViewerFromRequest } from "@/lib/auth";

export const metadata = {
  title: "House of Phoenix",
  description:
    "A phoenix-inspired perfume storefront with products, customer login, cart storage, and an admin studio."
};

export default async function RootLayout({ children }) {
  const viewer = await getViewerFromRequest();

  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <div className="site-glow site-glow-left" />
          <div className="site-glow site-glow-right" />
          <SiteHeader viewer={viewer} />
          <main className="page-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

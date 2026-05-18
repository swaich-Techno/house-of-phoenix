import Link from "next/link";
import { brand, contactDetails, footerLinks } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-shell">
        <div className="footer-panel">
          <div className="footer-grid">
            <div>
              <h2 className="footer-title">{brand.name}</h2>
            </div>
            <div>
              <h3 className="footer-title">Shop</h3>
              <div className="footer-links">
                {footerLinks.map((item) => (
                  <Link className="footer-link" href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="footer-title">Contact</h3>
              <div className="social-links">
                <span className="footer-link">{contactDetails.email}</span>
                <span className="footer-link">{contactDetails.phone}</span>
                <span className="footer-link">{contactDetails.whatsapp}</span>
                <span className="footer-link">{contactDetails.instagram}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import ContactForm from "@/components/ContactForm";
import { brand, contactDetails } from "@/lib/site";

export default function ContactPage() {
  return (
    <section className="page-section">
      <div className="section-shell">
        <div className="split-hero">
          <div className="hero-copy">
            <span className="eyebrow">Contact House of Phoenix</span>
            <h1>Let clients reach you from the footer and a dedicated contact page.</h1>
            <p className="section-copy">
              This page is ready for inquiries, gifting requests, launch questions,
              and personal fragrance recommendations. You can edit the contact
              details later from a single file.
            </p>
          </div>
          <div className="contact-card-grid">
            <article className="info-card">
              <span className="info-label">Email</span>
              <strong>{contactDetails.email}</strong>
            </article>
            <article className="info-card">
              <span className="info-label">Phone</span>
              <strong>{contactDetails.phone}</strong>
            </article>
            <article className="info-card">
              <span className="info-label">WhatsApp</span>
              <strong>{contactDetails.whatsapp}</strong>
            </article>
            <article className="info-card">
              <span className="info-label">Hours</span>
              <strong>{contactDetails.hours}</strong>
            </article>
          </div>
        </div>

        <div className="contact-layout">
          <div className="content-card contact-story-card">
            <span className="eyebrow">Brand Note</span>
            <h2>{brand.shortDescription}</h2>
            <p className="section-copy">
              Use this section for launch notes, wholesale inquiries, and event
              partnerships. The footer and this page both point customers to the
              same details so they are easy to update later.
            </p>
            <div className="info-stack">
              <div>
                <span className="info-label">Instagram</span>
                <strong>{contactDetails.instagram}</strong>
              </div>
              <div>
                <span className="info-label">WhatsApp</span>
                <strong>{contactDetails.whatsapp}</strong>
              </div>
              <div>
                <span className="info-label">GPay Placeholder</span>
                <strong>{contactDetails.gpayUpi}</strong>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Unable to send your message.");
          return;
        }

        setForm({
          name: "",
          email: "",
          phone: "",
          message: ""
        });
        setMessage("Your inquiry has been saved.");
      })();
    });
  }

  return (
    <form className="content-card" onSubmit={handleSubmit}>
      <span className="eyebrow">Send Inquiry</span>
      <h2>Contact the brand directly</h2>
      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Name</span>
          <input
            className="form-input"
            onChange={(event) => updateField("name", event.target.value)}
            required
            type="text"
            value={form.name}
          />
        </label>
        <label className="form-field">
          <span className="form-label">Email</span>
          <input
            className="form-input"
            onChange={(event) => updateField("email", event.target.value)}
            required
            type="email"
            value={form.email}
          />
        </label>
        <label className="form-field">
          <span className="form-label">Phone</span>
          <input
            className="form-input"
            onChange={(event) => updateField("phone", event.target.value)}
            type="tel"
            value={form.phone}
          />
        </label>
        <label className="form-field form-field-wide">
          <span className="form-label">Message</span>
          <textarea
            className="form-textarea"
            onChange={(event) => updateField("message", event.target.value)}
            required
            value={form.message}
          />
        </label>
      </div>
      {message ? <div className="status-banner">{message}</div> : null}
      <button className="button-primary" disabled={isPending} type="submit">
        {isPending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

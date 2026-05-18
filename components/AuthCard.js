"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const copy = {
  login: {
    eyebrow: "Customer Login",
    title: "Return to your House of Phoenix cart.",
    description:
      "Sign in to save products, continue checkout, and manage your account journey."
  },
  register: {
    eyebrow: "Customer Registration",
    title: "Create a storefront account in minutes.",
    description:
      "Customers can register, log in later, and keep products saved to their cart."
  }
};

export default function AuthCard({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get("next") || "/";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const isRegister = mode === "register";
  const pageCopy = copy[mode];

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    startTransition(() => {
      void (async () => {
        const response = await fetch(
          isRegister ? "/api/auth/register" : "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }

        if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(nextTarget);
        }

        router.refresh();
      })();
    });
  }

  return (
    <section className="auth-shell">
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-copy">
            <span className="eyebrow">{pageCopy.eyebrow}</span>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>
          <form className="auth-copy auth-form" onSubmit={handleSubmit}>
            {isRegister ? (
              <label className="form-field">
                <span className="form-label">Full name</span>
                <input
                  className="form-input"
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Your name"
                  required
                  type="text"
                  value={form.name}
                />
              </label>
            ) : null}

            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                className="form-input"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password</span>
              <input
                className="form-input"
                minLength={6}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="At least 6 characters"
                required
                type="password"
                value={form.password}
              />
            </label>

            {error ? <div className="status-banner">{error}</div> : null}

            <button className="button-primary" disabled={isPending} type="submit">
              {isPending
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Login"}
            </button>

            <div className="auth-links">
              {isRegister ? (
                <Link className="footer-link" href="/login">
                  Already have an account? Login
                </Link>
              ) : (
                <Link className="footer-link" href="/register">
                  Need an account? Register
                </Link>
              )}
              <Link className="footer-link" href="/">
                Back to storefront
              </Link>
            </div>
          </form>
        </div>

        <div className="auth-card auth-visual">
          <div className="auth-panel">
            <span className="eyebrow">Phoenix Identity</span>
            <div className="auth-orbit">
              <div className="auth-core" />
            </div>
            <p className="section-copy">
              The customer flow is intentionally simple so you can launch the
              essential storefront first. If you register using the email stored
              in <code>ADMIN_EMAIL</code>, that account becomes the admin account.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

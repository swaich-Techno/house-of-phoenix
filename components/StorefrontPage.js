"use client";

import Link from "next/link";
import { useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { brand, featureCards } from "@/lib/site";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function StorefrontPage({
  databaseIssue,
  products,
  viewer,
  databaseConfigured
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const featuredProduct = products.find((product) => product.featured) || products[0];
  const search = deferredSearchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      product.name,
      product.description,
      product.notes,
      product.tag
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });

  function ensureLogin(next = "/") {
    if (!viewer) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return false;
    }

    return true;
  }

  function runCartAction(productId, mode) {
    if (!ensureLogin(mode === "buy" ? "/checkout" : "/cart")) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productId,
            quantity: 1
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setNotice(data.error || "Unable to update your cart.");
          return;
        }

        setNotice(
          mode === "buy"
            ? "Added to cart. Opening checkout..."
            : "Added to cart successfully."
        );

        if (mode === "buy") {
          router.push("/checkout");
          return;
        }

        router.refresh();
      })();
    });
  }

  return (
    <>
      <section className="hero-section">
        <div className="section-shell">
          <div className="storefront-hero">
            <div className="hero-copy">
              <span className="eyebrow">House of Phoenix</span>
              <p className="hero-kicker">{brand.tagline}</p>
              <h1>A calmer minimalist storefront with warm orange accents.</h1>
              <p className="lead-copy">
                {brand.shortDescription} This version is intentionally cleaner:
                more whitespace, simpler cards, a clearer shopping flow, and soft
                organic orange motion instead of heavy visual effects.
              </p>
              <div className="hero-actions">
                <Link className="button-primary" href="#collections">
                  Shop now
                </Link>
                <Link className="button-secondary" href="/contact">
                  Contact us
                </Link>
              </div>
              <div className="hero-metrics">
                <div className="metric-item">
                  <span className="info-label">Customer access</span>
                  <strong>Login and register</strong>
                </div>
                <div className="metric-item">
                  <span className="info-label">Cart</span>
                  <strong>Saved by account</strong>
                </div>
                <div className="metric-item">
                  <span className="info-label">Admin</span>
                  <strong>Upload products directly</strong>
                </div>
              </div>
              {!databaseConfigured ? (
                <div className="notice-banner">
                  <strong>Demo storage is active.</strong>{" "}
                  {databaseIssue
                    ? "Your MongoDB connection could not be reached, so the app is using local demo storage for now."
                    : "Products, users, cart data, and contact submissions become permanent after you add MONGODB_URI."}
                </div>
              ) : null}
              {notice ? <div className="status-banner">{notice}</div> : null}
            </div>

            {featuredProduct ? (
              <div className="hero-preview">
                <div className="hero-preview-image">
                  <img alt={featuredProduct.name} src={featuredProduct.image} />
                </div>
                <div className="hero-preview-copy">
                  <span className="info-label">Featured perfume</span>
                  <h2>{featuredProduct.name}</h2>
                  <p className="section-copy">{featuredProduct.description}</p>
                  <div className="chip-row">
                    <span className="pill">
                      {featuredProduct.category} / {featuredProduct.size}
                    </span>
                    <span className="pill">{featuredProduct.notes}</span>
                  </div>
                  <div className="hero-preview-footer">
                    <strong className="price-text">
                      {currencyFormatter.format(featuredProduct.price)}
                    </strong>
                    <button
                      className="button-primary"
                      disabled={isPending}
                      onClick={() => runCartAction(featuredProduct.id, "buy")}
                      type="button"
                    >
                      Buy featured
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="feature-grid feature-grid-simple">
            {featureCards.map((feature) => (
              <article className="content-card feature-card-minimal" key={feature.title}>
                <span className="info-label">{feature.title}</span>
                <p className="section-copy">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" id="collections">
        <div className="section-shell">
          <div className="section-header">
            <div>
              <span className="eyebrow">Collection</span>
              <h2 className="section-title">Shop the current catalog</h2>
            </div>
            <div className="search-row">
              <input
                className="search-input"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product name or notes"
                type="search"
                value={searchTerm}
              />
            </div>
          </div>

          <div className="chip-row chip-row-categories">
            {categories.map((category) => (
              <button
                className={
                  category === activeCategory ? "button-primary" : "button-secondary"
                }
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-media">
                  <span className="product-tag">{product.tag}</span>
                  <img alt={product.name} src={product.image} />
                </div>
                <div className="product-content">
                  <div className="product-title-row">
                    <div>
                      <h3 className="product-title">{product.name}</h3>
                      <span className="product-notes">
                        {product.category} / {product.size}
                      </span>
                    </div>
                    <strong className="price-text">
                      {currencyFormatter.format(product.price)}
                    </strong>
                  </div>
                  <p className="product-description">{product.description}</p>
                  <div className="chip-row">
                    <span className="pill">{product.notes}</span>
                    <span className="pill">Stock {product.inventory}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="button-primary"
                      disabled={isPending}
                      onClick={() => runCartAction(product.id, "cart")}
                      type="button"
                    >
                      Add to cart
                    </button>
                    <button
                      className="button-secondary"
                      disabled={isPending}
                      onClick={() => runCartAction(product.id, "buy")}
                      type="button"
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-shell">
          <div className="split-hero">
            <div className="content-card">
              <span className="eyebrow">Customer Flow</span>
              <h2>Customers can sign in, save their cart, and continue later.</h2>
              <p className="section-copy">
                The shopping path stays clean and familiar: register, log in, add
                products to cart, and move to checkout whenever you are ready.
              </p>
              <div className="card-actions">
                {!viewer ? (
                  <>
                    <Link className="button-primary" href="/register">
                      Create customer account
                    </Link>
                    <Link className="button-secondary" href="/login">
                      Existing customer login
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="button-primary" href="/cart">
                      Open your cart
                    </Link>
                    <Link className="button-secondary" href="/contact">
                      Ask about custom orders
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="content-card">
              <span className="eyebrow">Admin Flow</span>
              <h2>Add products with direct image upload from the admin studio.</h2>
              <p className="section-copy">
                Upload product images directly from your computer, fill in the
                details, and keep the storefront updated without managing image
                links manually.
              </p>
              <div className="card-actions">
                {viewer?.role === "admin" ? (
                  <Link className="button-primary" href="/admin">
                    Open admin studio
                  </Link>
                ) : (
                  <Link className="button-secondary" href="/register">
                    Register the admin email
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

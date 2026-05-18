"use client";

import Link from "next/link";
import { useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/site";

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
              <h1>{brand.name}</h1>
              <div className="hero-actions">
                <Link className="button-primary" href="#collections">
                  Shop
                </Link>
                <Link className="button-secondary" href="/contact">
                  Contact
                </Link>
              </div>
              {!databaseConfigured && viewer?.role === "admin" ? (
                <div className="notice-banner">
                  <strong>Demo mode.</strong>{" "}
                  {databaseIssue
                    ? "MongoDB is not connected."
                    : "Add MONGODB_URI for permanent data."}
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
                  <h2>{featuredProduct.name}</h2>
                  <span className="product-notes">
                    {featuredProduct.category} / {featuredProduct.size}
                  </span>
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
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="page-section" id="collections">
        <div className="section-shell">
          <div className="section-header">
            <h2 className="section-title">Shop</h2>
            <div className="search-row">
              <input
                className="search-input"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
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
                      Buy
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filteredProducts.length ? (
            <div className="content-card empty-state">No products found.</div>
          ) : null}
        </div>
      </section>
    </>
  );
}

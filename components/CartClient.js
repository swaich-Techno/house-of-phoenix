"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function CartClient({ initialCart, viewer }) {
  const [cart, setCart] = useState(initialCart);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  function syncCart(method, path = "/api/cart", body) {
    startTransition(() => {
      void (async () => {
        const response = await fetch(path, {
          method,
          headers:
            method === "PATCH" || method === "POST"
              ? { "Content-Type": "application/json" }
              : undefined,
          body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();

        if (!response.ok) {
          setNotice(data.error || "Unable to update cart.");
          return;
        }

        setCart(data.cart);
        setNotice("Cart updated.");
      })();
    });
  }

  return (
    <section className="page-section">
      <div className="section-shell">
        <div className="split-hero">
          <div className="hero-copy">
            <span className="eyebrow">Saved Cart</span>
            <h1>{viewer.name}, your selections are ready.</h1>
            <p className="section-copy">
              Your cart is linked to your account, so customers can log in and
              continue where they left off.
            </p>
            {notice ? <div className="status-banner">{notice}</div> : null}
          </div>
          <div className="content-card order-total-card">
            <span className="info-label">Order total</span>
            <p className="total-number">{currencyFormatter.format(cart.subtotal)}</p>
            <p className="section-copy">
              {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} selected
            </p>
            <div className="card-actions">
              <Link className="button-primary" href="/checkout">
                Continue to checkout
              </Link>
              <button
                className="button-secondary"
                disabled={!cart.items.length || isPending}
                onClick={() => syncCart("DELETE", "/api/cart?clear=1")}
                type="button"
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>Cart Items</h2>
          {cart.items.length ? (
            <div className="cart-list">
              {cart.items.map((item) => (
                <article className="cart-row" key={item.productId}>
                  <div className="cart-product">
                    <div className="cart-item-image">
                      <img alt={item.product.name} src={item.product.image} />
                    </div>
                    <div>
                      <h3 className="product-title">{item.product.name}</h3>
                      <p className="section-copy">{item.product.description}</p>
                      <span className="pill">
                        {item.product.size} / {item.product.notes}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong className="price-text">
                      {currencyFormatter.format(item.lineTotal)}
                    </strong>
                    <div className="cart-actions">
                      <div className="quantity-control">
                        <button
                          className="quantity-button"
                          disabled={isPending}
                          onClick={() =>
                            syncCart("PATCH", "/api/cart", {
                              productId: item.productId,
                              quantity: item.quantity - 1
                            })
                          }
                          type="button"
                        >
                          -
                        </button>
                        <span className="pill">Qty {item.quantity}</span>
                        <button
                          className="quantity-button"
                          disabled={isPending}
                          onClick={() =>
                            syncCart("PATCH", "/api/cart", {
                              productId: item.productId,
                              quantity: item.quantity + 1
                            })
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="button-muted"
                        disabled={isPending}
                        onClick={() =>
                          syncCart("DELETE", `/api/cart?productId=${item.productId}`)
                        }
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="section-stack">
              <p className="section-copy">
                Your cart is empty right now. Head back to the home page and add a
                few House of Phoenix fragrances.
              </p>
              <Link className="button-primary" href="/">
                Browse perfumes
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewerFromRequest } from "@/lib/auth";
import { contactDetails } from "@/lib/site";
import { getCartForUser } from "@/lib/store";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const viewer = await getViewerFromRequest();

  if (!viewer) {
    redirect("/login?next=/checkout");
  }

  const cart = await getCartForUser(viewer.id);

  return (
    <section className="page-section">
      <div className="section-shell">
        <div className="split-hero">
          <div className="hero-copy">
            <span className="eyebrow">Checkout Placeholder</span>
            <h1>GPay can be connected later without rebuilding the whole site.</h1>
            <p className="section-copy">
              For now, this page gives you the correct checkout structure, order
              summary, and payment instructions area. You can replace the
              placeholder section with a real gateway when you are ready.
            </p>
          </div>
          <div className="content-card checkout-note-card">
            <span className="info-label">Current GPay Placeholder</span>
            <strong>{contactDetails.gpayUpi}</strong>
            <p className="section-copy">
              Add your real UPI or GPay collection method later in{" "}
              <code>.env.local</code> using <code>NEXT_PUBLIC_GPAY_UPI</code>.
            </p>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="content-card">
            <h2>Order Summary</h2>
            {cart.items.length ? (
              <div className="summary-list">
                {cart.items.map((item) => (
                  <article className="summary-row" key={item.productId}>
                    <div>
                      <strong>{item.product.name}</strong>
                      <p>
                        Qty {item.quantity} / {item.product.size}
                      </p>
                    </div>
                    <strong>{currencyFormatter.format(item.lineTotal)}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <p className="section-copy">
                Your cart is empty. Add a few perfumes before moving to checkout.
              </p>
            )}
          </div>

          <div className="content-card order-total-card">
            <h2>Payment Guidance</h2>
            <p className="total-number">{currencyFormatter.format(cart.subtotal)}</p>
            <p className="section-copy">
              This MVP stops before the difficult live-payment integration. Your
              cart and order flow are ready, and you can later connect a real
              gateway or UPI workflow here.
            </p>
            <Link className="button button-primary" href="/contact">
              Confirm order manually
            </Link>
            <Link className="button button-secondary" href="/cart">
              Back to cart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

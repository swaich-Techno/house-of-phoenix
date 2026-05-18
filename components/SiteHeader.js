"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { brand } from "@/lib/site";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/contact", label: "Contact" }
];

export default function SiteHeader({ viewer }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      void (async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      })();
    });
  }

  const menuItems =
    viewer?.role === "admin"
      ? [...navItems, { href: "/admin", label: "Admin Studio" }]
      : navItems;

  return (
    <header className="site-header">
      <div className="header-shell">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark" aria-hidden="true">
            <img src="/phoenix-mark.svg" alt="" />
          </span>
          <span>
            <strong className="brand-name">{brand.name}</strong>
            <span className="brand-tagline">{brand.tagline}</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Primary">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={isActive ? "nav-link-active" : "nav-link"}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          {viewer ? (
            <>
              <span className="viewer-pill">
                {viewer.name} / {viewer.role}
              </span>
              <button
                className="button-secondary"
                disabled={isPending}
                onClick={handleLogout}
                type="button"
              >
                {isPending ? "Leaving..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link className="button-secondary" href="/login">
                Login
              </Link>
              <Link className="button-primary" href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

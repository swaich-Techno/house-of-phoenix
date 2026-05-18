export const brand = {
  name: "House of Phoenix",
  tagline: "Alcohol-based perfumes with a smoky, radiant signature.",
  shortDescription:
    "A phoenix-inspired fragrance house built around bold flames, velvety woods, and lingering evening trails.",
  story:
    "House of Phoenix is designed as a premium perfume showcase where every bottle feels ceremonial, dramatic, and gift-worthy."
};

export const contactDetails = {
  email: "care@houseofphoenix.com",
  phone: "+917009464475",
  hours: "Monday to Saturday, 11:00 AM to 8:00 PM",
  instagram: "@houseofphoenix",
  whatsapp: "+917009464475",
  gpayUpi: process.env.NEXT_PUBLIC_GPAY_UPI || "houseofphoenix@okaxis"
};

export const featureCards = [
  {
    title: "Signature Blends",
    description:
      "Statement perfumes built around saffron, smoked florals, amber woods, and warm resins."
  },
  {
    title: "Luxury Gifting",
    description:
      "Elegant bottle presentation and ceremonial styling that feels premium from the first glance."
  },
  {
    title: "Personal Service",
    description:
      "Fast support, curated recommendations, and a direct contact flow for special orders."
  }
];

export const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" }
];

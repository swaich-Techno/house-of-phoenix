# House of Phoenix Storefront

A minimalist e-commerce MVP for an alcohol-based perfume brand. This version includes the essential flows you asked for:

- customer registration and login
- homepage with product listing
- cart and checkout structure
- contact page and footer contact details
- admin area for adding and editing products
- GPay placeholder section for later payment integration

## What is included right now

- `/` homepage with a clean white-and-orange storefront, filters, and add-to-cart flow
- `/login` and `/register` for customers
- `/cart` for logged-in users
- `/checkout` as a GPay-ready placeholder page
- `/contact` with a contact form plus footer contact details
- `/admin` for product management
- API routes for auth, products, cart, and contact form submissions

## Important MVP note

This starter supports a **demo mode** when MongoDB is not configured yet.

- The website still runs locally.
- Products, accounts, carts, and inquiries are stored in memory only.
- When the server restarts, demo-mode data resets.

For real persistent data on Vercel, add `MONGODB_URI`.

## Admin login rule

The account whose email matches `ADMIN_EMAIL` becomes the admin account.

Default admin email in `.env.example`:

```env
ADMIN_EMAIL=admin@houseofphoenix.com
```

So if you register with `admin@houseofphoenix.com`, that account will open the admin dashboard.

## 1. Install

Open PowerShell in this folder and run:

```powershell
npm.cmd install
```

## 2. Create your env file

Copy `.env.example` to `.env.local`.

Example:

```env
MONGODB_URI=
MONGODB_DB=house-of-phoenix
JWT_SECRET=replace-this-with-a-long-random-secret
ADMIN_EMAIL=admin@houseofphoenix.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GPAY_UPI=houseofphoenix@okaxis
```

### For local demo mode

You can leave `MONGODB_URI` empty for now.

### For real persistent data

Use a MongoDB Atlas free database and place the full connection string in:

```env
MONGODB_URI=your-mongodb-connection-string
```

## 3. Run locally

```powershell
npm.cmd run dev
```

Then open:

[http://localhost:3000](http://localhost:3000)

## 4. Build for production check

```powershell
npm.cmd run build
```

## Where to edit common business details

- brand name, footer contact details, and GPay placeholder:
  - `lib/site.js`
- homepage and minimalist styling:
  - `components/StorefrontPage.js`
  - `app/globals.css`
- admin product form:
  - `components/AdminDashboard.js`

## How to add real product photos

In the admin dashboard, use the upload input to select an image from your device.

The app compresses the image before saving it with the product record.

You can still switch back to the bundled placeholder image from the admin form.

## Current payment status

Live GPay integration is **not** connected yet.

Right now the site includes:

- cart flow
- checkout structure
- GPay placeholder text using `NEXT_PUBLIC_GPAY_UPI`
- manual order confirmation path through the contact page

## Suggested next upgrades after this MVP

1. Connect a real payment flow.
2. Add order history and order management.
3. Add product detail pages.
4. Add shipping and delivery settings.
5. Move uploaded images to a cloud image service for larger catalogs.

## GitHub and Vercel handoff

When uploading this project, include the source files only.

Do not upload:

- `.next`
- `node_modules`
- `.vercel`
- `.env.local`

On Vercel, add the same environment variables from `.env.local`, especially:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_GPAY_UPI`

## Brand placeholders you should replace later

These are example placeholders right now and should be updated with your real brand details:

- email
- phone number
- GPay UPI ID
- product photos

## Tech stack

- Next.js App Router
- React
- MongoDB
- custom cookie auth

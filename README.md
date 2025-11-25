# Lumeza — Static Website (Starter)

This is a lightweight static website starter for **Lumeza** (catalogue-first, light e-commerce). It uses Tailwind CDN for styling and vanilla JavaScript for interactivity (cart, wishlist, search, filters). It's intended as a fast prototype you can host on Netlify, Vercel, GitHub Pages, or any static file host.

## Features
- Home, About, Products, Product detail, Gallery, Contact, Cart, Checkout (stub)
- Product data loaded from `js/products.json`
- Search, category filters, wishlist (localStorage), cart (localStorage)
- WhatsApp quick contact integration
- Placeholder SVG images (replace with real photos)
- Easy to convert to Next.js / React if you want server-side features

## How to use locally
1. Open `index.html` in a browser for a quick preview (some browsers block fetch of local JSON; use a local server for full functionality).
2. For a local dev server (recommended):
   - Python 3: `python -m http.server 8000` then open `http://localhost:8000`
   - Or use `live-server`, `serve`, etc.

## Replace placeholders
- Replace images in `assets/images/` with your product and hero images.
- Update `js/products.json` with real products, SKUs, and inventory.
- Add payment integration (Razorpay / Stripe) on the checkout page when ready.

## Admin
Lightweight admin provided at `admin/index.html` for local editing, import/export JSON, and preview of orders in localStorage.

## Contact
Owner: Lumeza  
Email: mail.lumeza@gmail.com  
Phone / WhatsApp: +91 79832 33092

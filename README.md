* Project intro
* Features
* Tech stack
* Screenshots placeholders
* Setup & install
* Project structure
* Development workflow
* Deployment
* Contributing & License

---

# 📦 Sakina TJ – E-Commerce Platform (single merchant architecture)

![Logo](public/images/logo.png) <!-- replace with actual logo path if exists -->

A modern, full-stack **e-commerce web application** built with **React, TypeScript, TailwindCSS, and Supabase**.
The platform is optimized for **mattresses, beds, and home comfort products**, featuring a fast responsive UI, secure payments, and a smooth shopping experience.

---

## ✨ Features

* **Modern UI/UX**

  * Responsive design (mobile-first)
  * Sticky headers & smooth navigation
  * Product carousels with swipe/drag support
  * Mobile drawer/cart support

* **E-Commerce Essentials**

  * Product catalog with categories
  * Cart system with add/remove/update
  * Multi-step checkout (contact → delivery → payment → confirmation)
  * Customer reviews with images/videos
  * Best-seller showcase
  * Category grid with mobile rail + desktop grid

* **Enhancements**

  * Accessible & SEO-friendly
  * Autoplay hero carousel with manual controls
  * Scroll progress indicators
  * Integrated map dropdown for showrooms (Google/2GIS/Apple Maps support)
  * Lazy-loading images with aspect ratio placeholders

* **Backend/Services**

  * Supabase for auth, DB, and APIs
  * Edge functions for secure payment handling (Alif Bank integration)
  * Context-based state management (CartContext, AuthContext)

---

## 🛠 Tech Stack

* **Frontend**

  * [React 18](https://react.dev/)
  * [TypeScript](https://www.typescriptlang.org/)
  * [Tailwind CSS](https://tailwindcss.com/)
  * [Lucide Icons](https://lucide.dev/)
  * React Router v6

* **Backend / Infra**

  * [Supabase](https://supabase.com/) (DB, Auth, Functions)
  * Alif Bank payment integration via Supabase Edge Functions

* **Tooling**

  * Vite (fast dev server + bundler)
  * ESLint + Prettier (code quality/formatting)
  * GitHub Actions (CI/CD ready)

---

## 📂 Project Structure

```
sakina-tj/
├── public/                # Static assets
├── src/
│   ├── components/        # UI components
│   │   ├── header/        # Desktop & Mobile headers
│   │   ├── hero/          # Hero carousel + slides
│   │   ├── category/      # Category grid + scroll controls
│   │   ├── product/       # Product details, modals, gallery
│   │   ├── cart/          # Cart modal + context
│   │   ├── features/      # Features grid
│   │   ├── benefits/      # Benefits cards
│   │   └── ...            # Other UI blocks
│   ├── contexts/          # Global state (CartContext, etc.)
│   ├── lib/               # API helpers & type definitions
│   ├── pages/             # Route components
│   ├── App.tsx            # App root
│   └── main.tsx           # Entry point
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/umedsondoniyor/sakina-tj.git
cd sakina-tj
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_FUNCTIONS_URL=your_functions_url
ALIF_MERCHANT_ID=your_alif_merchant_id
ALIF_SECRET_KEY=your_alif_secret_key
```

### 4. Run development server

```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## 🖼 Screenshots

### Hero Carousel

![Hero Carousel](docs/screenshots/hero.png)

### Category Grid

![Category Grid](docs/screenshots/category.png)

### Cart Modal

![Cart Modal](docs/screenshots/cart.png)

---

## ⚙️ Deployment

### Netlify (recommended)

* Connect your repo
* Set build command: `npm run build`
* Set publish directory: `dist/`
* Add environment variables in **Netlify Dashboard → Site settings → Build & deploy → Environment**

### Vercel

* Import repo into Vercel
* Build command: `npm run build`
* Output directory: `dist/`

---

## 🧑‍💻 Development Workflow

* **Branching:**
  Use feature branches (`feature/cart`, `fix/responsive-header`) and PRs.
* **Linting & Formatting:**
  Run `npm run lint` before committing.
* **Commits:**
  Follow [Conventional Commits](https://www.conventionalcommits.org/) for clear history.

---

## 📦 Future Improvements

* User authentication + profile management
* Wishlist / favorites
* Advanced product filters
* Internationalization (RU/TJ/EN)
* Admin dashboard for managing products/orders
* Better unit/integration tests

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/new-thing`)
3. Commit changes (`git commit -m "feat: add new thing"`)
4. Push branch (`git push origin feature/new-thing`)
5. Create Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.
You are free to use, modify, and distribute with attribution.

---

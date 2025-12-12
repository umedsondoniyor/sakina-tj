# 📦 Sakina TJ – E-Commerce Platform

![Logo](public/images/logo.png)

A modern, full-stack **e-commerce web application** built with **React, TypeScript, TailwindCSS, and Supabase**. The platform is optimized for **mattresses, beds, and home comfort products**, featuring a fast responsive UI, secure payments, comprehensive admin panel with role-based access control, and a smooth shopping experience.

---

## ✨ Features

### 🛍️ E-Commerce Essentials

* **Product Catalog**
  * Product catalog with categories and filtering
  * Product variants with inventory management
  * Related products recommendations
  * Product images with lazy loading
  * Detailed product pages with specifications

* **Shopping Experience**
  * Cart system with add/remove/update functionality
  * Multi-step checkout (contact → delivery → payment → confirmation)
  * **One-click ordering system**
    * Quick order form for fast purchases
    * Minimal information required (name, phone, product)
    * Separate order tracking in admin panel
    * Order confirmation pages
  * Customer reviews with images/videos
  * Best-seller showcase
  * Category grid with mobile rail + desktop grid

* **Payment Integration**
  * Alif Bank payment gateway integration
  * Secure payment processing via Supabase Edge Functions
  * Payment status tracking (pending, processing, completed, failed, cancelled)
  * Payment success/failure/cancel pages
  * Comprehensive SMS notification system
  * Support for multiple payment methods (Alif Bank, Alif Wallet, Korti Milli, Visa, Mastercard, etc.)
  * Discount and coupon support
  * Delivery type options (home delivery, pickup)

### 🎨 Modern UI/UX

* **Responsive Design**
  * Mobile-first responsive design
  * Sticky headers & smooth navigation
  * Product carousels with swipe/drag support
  * Mobile drawer/cart support
  * Touch-friendly interactions

* **User Experience**
  * Accessible & SEO-friendly
  * Autoplay hero carousel with manual controls
  * Scroll progress indicators
  * Integrated map dropdown for showrooms (Google/2GIS/Apple Maps support)
  * Lazy-loading images with aspect ratio placeholders
  * Smooth page transitions

### 📝 Content Management

* **Blog System**
  * Blog posts with markdown support
  * Blog categories and tags
  * Featured images and SEO metadata
  * Blog post search and filtering

* **Reviews & Testimonials**
  * Customer reviews with ratings
  * Image and video uploads
  * Review moderation system
  * Display on product pages

* **Static Content**
  * About Us page management
  * Services page
  * Delivery & Payment information
  * Hero carousel management

### 🔐 Admin Panel

* **Authentication & Authorization**
  * Secure admin login system
  * Role-Based Access Control (RBAC) with 4 roles:
    * **Admin**: Full access to all features
    * **Editor**: Content management (products, blog, carousel, etc.)
    * **Moderator**: Order and review management
    * **User**: Limited access (for future features)
  * Dynamic menu permissions (database-driven)
  * Route-level protection
  * Session management

* **Dashboard**
  * Real-time statistics and analytics
  * Revenue tracking (total, today, yesterday)
  * Order statistics (pending, completed)
  * Payment statistics
  * Product and user counts
  * Revenue trends and comparisons

* **Product Management**
  * Create, edit, and delete products
  * Product variants management
  * Inventory tracking
  * Related products configuration
  * Product images upload

* **Order Management**
  * **One-click orders management**
    * View all one-click orders
    * Order status tracking (pending, processing, completed)
    * Order details and customer information
    * Quick actions (update status, view details)
  * **Payment orders management**
    * Full payment order tracking
    * Payment status management
    * Order details with items, customer, and delivery info
    * Manual status updates with SMS notifications
    * Payment method tracking
    * Discount and coupon tracking

* **User Management**
  * User account management
  * Role assignment
  * User profile editing
  * User deletion (with proper cleanup)

* **Content Management**
  * Hero carousel slides management
  * Blog posts and categories
  * Reviews moderation
  * About Us content
  * Services content
  * Delivery & Payment information
  * Navigation menu management
  * Showrooms management

* **Role Management**
  * Dynamic role-based menu permissions
  * Configure which roles can access specific menu items
  * Database-driven permission system
  * Real-time permission updates

* **Additional Features**
  * Quiz/Questionnaire management
  * SMS templates management
  * Club members management
  * Mattresses content management

### 🔧 Backend & Infrastructure

* **Supabase Integration**
  * PostgreSQL database with Row Level Security (RLS)
  * Real-time subscriptions
  * Authentication system
  * Storage for images and files
  * Edge Functions for serverless operations

* **Edge Functions**
  * `alif-payment-init`: Initialize Alif Bank payments
  * `alif-payment-callback`: Handle payment callbacks
  * `create-user`: Create new user accounts (admin only)
  * `manage-user`: Update/delete users (admin only)
  * `create-admin`: Create admin accounts
  * `send-club-login-otp`: Send OTP for club member login
  * `verify-club-login-otp`: Verify club member OTP
  * `send-payment-sms`: Send SMS notifications for payments

* **Database Features**
  * Comprehensive database migrations
  * Row Level Security policies
  * Database triggers for automatic updates
  * Optimized indexes for performance

---

## 💳 Payment Flow & SMS Notifications

### Payment Process Flow

The payment system follows a secure, multi-step process:

#### 1. **Payment Initiation** (`alif-payment-init`)
   * Customer completes checkout form (contact info → delivery → payment)
   * Payment record is created in database with status `pending`
   * Payment request is sent to Alif Bank payment gateway
   * Customer is redirected to Alif Bank payment page
   * Payment includes:
     * Order amount (with discounts if applicable)
     * Customer information (name, phone, email)
     * Delivery information (type, address)
     * Order items list
     * Payment method selection

#### 2. **Payment Processing** (Alif Bank)
   * Customer completes payment on Alif Bank page
   * Payment can be:
     * **Completed**: Payment successful
     * **Pending**: Payment awaiting approval
     * **Cancelled**: Customer cancelled payment
     * **Failed**: Payment failed

#### 3. **Payment Callback** (`alif-payment-callback`)
   * Alif Bank sends secure callback with payment result
   * Callback is verified using HMAC-SHA256 token validation
   * Payment status is updated in database:
     * `ok/success/approved/paid` → `completed`
     * `pending/processing/wait` → `pending`
     * `cancel/canceled` → `cancelled`
     * Other → `failed`
   * Transaction ID and callback payload are stored
   * **SMS notifications are automatically sent** (see below)

#### 4. **Payment Status Pages**
   * **Success**: Customer redirected to `/payment/success`
   * **Cancel**: Customer redirected to `/payment/cancel`
   * **Failed**: Customer redirected to `/payment/failed`
   * Order confirmation page shows order details

### SMS Notification System

The platform includes a comprehensive SMS notification system that keeps customers, managers, and delivery teams informed at every step.

#### SMS Notification Triggers

**1. Automatic Notifications (Payment Completed)**
   * **When**: Payment status changes to `completed` via Alif Bank callback
   * **Condition**: Only sent if delivery type is NOT `pickup` (home delivery only)
   * **Recipients**:
     * ✅ **Customer**: Confirmation of successful payment
     * ✅ **Manager**: New order notification with full details
     * ✅ **Delivery Team**: Order ready for delivery notification
   * **Template**: Uses active SMS templates from `sms_templates` table

**2. Manual Status Updates (Admin Panel)**
   * **When**: Admin manually updates payment status in admin panel
   * **Status: `pending`**:
     * 📱 **Manager**: Receives notification about new pending order
     * 📋 **Content**: Order details, customer info, items list, amount, delivery info
   
   * **Status: `confirmed`**:
     * 🚚 **Delivery Team**: Receives notification about order ready for delivery
     * 📋 **Content**: Order details, customer info, delivery address, items list
   
   * **Status: `completed`**:
     * ❌ **No SMS sent** (order already processed)

#### SMS Template System

SMS notifications use customizable templates stored in the database:

* **Template Types**:
  * `admin_payment_notification`: Manager notifications (pending status)
  * `delivery_team_notification`: Delivery team notifications (confirmed status)
  * `customer_payment_confirmation`: Customer confirmation (completed status)
  * Custom templates can be created via admin panel

* **Template Variables**:
  * `{{orderTitle}}` - Order/product title
  * `{{payment.customer_name}}` - Customer name
  * `{{payment.customer_phone}}` - Customer phone
  * `{{payment.customer_email}}` - Customer email
  * `{{payment.amount}}` - Order amount (with discount info if applicable)
  * `{{payment.currency}}` - Currency (TJS)
  * `{{payment.alif_order_id}}` - Alif Bank order ID
  * `{{payment.alif_transaction_id}}` - Transaction ID
  * `{{payment.payment_gateway}}` - Payment method (Alif Bank, Visa, etc.)
  * `{{payment.delivery_type}}` - Delivery type (home/pickup)
  * `{{payment.delivery_address}}` - Delivery address
  * `{{payment.status}}` - Payment status
  * `{{items_list}}` - Formatted items list
  * `{{items_count}}` - Number of items
  * `{{items_total_quantity}}` - Total quantity
  * `{{discount.amount}}` - Discount amount
  * `{{discount.percentage}}` - Discount percentage
  * `{{order.subtotal}}` - Subtotal before discount
  * `{{manager_phone}}` - Manager phone number
  * `{{delivery_phone}}` - Delivery team phone number

* **Template Features**:
  * Templates are stored in `sms_templates` table
  * Can be activated/deactivated via `is_active` flag
  * Ordered by `order_index` for multiple templates
  * Support for multiple recipients per template
  * Phone numbers can use template variables
  * Custom sender address (default: "SAKINA")
  * Priority and SMS type configuration

#### SMS Recipients Configuration

Phone numbers for SMS recipients are configured in two ways:

1. **SMS Templates** (Recommended):
   * Manager phone: Stored in `admin_payment_notification` template
   * Delivery phone: Stored in `delivery_team_notification` template
   * Can be updated via admin panel → SMS Templates

2. **Environment Variables** (Fallback):
   * `MANAGER_PHONE`: Manager phone number (fallback: +992936337785)
   * `DELIVERY_PHONE`: Delivery team phone number (fallback: +992936337785)

#### SMS Content Details

**Customer Notification (Payment Completed)**:
```
✅ Оплата прошла успешно! Ваш заказ: «[Order Title]». 
Спасибо, что выбрали Sakina.tj 🙏
```

**Manager Notification (Pending Status)**:
```
⏰ Новый заказ: [Order Title]

Сумма: [Amount with discount] | [Payment Method] | [Delivery Info]
Клиент: [Name] | [Phone] | [Email]

Товары ([Count] позиций):
1. [Item Name] ([Quantity] шт. × [Price] TJS)
...
```

**Delivery Team Notification (Confirmed Status)**:
```
🚚 Заказ для доставки: [Order Title]

Сумма: [Amount with discount] | [Payment Method] | [Delivery Info]
Клиент: [Name] | [Phone] | [Email]

Товары ([Count] позиций):
1. [Item Name] ([Quantity] шт. × [Price] TJS)
...
```

#### SMS API Integration

* **Provider**: Alif Tech SMS API (`https://sms2.aliftech.net/api/v1/sms/bulk`)
* **Authentication**: API Key via `SMS_API_KEY` environment variable
* **Features**:
  * Bulk SMS sending
  * Scheduled delivery
  * Message expiration (10 minutes default)
  * Priority levels
  * Delivery status tracking

#### Managing SMS Templates

1. Login to admin panel as admin
2. Navigate to "SMS Шаблоны" (SMS Templates)
3. Create/edit templates with:
   * Template name (e.g., `admin_payment_notification`)
   * Phone number (can use variables)
   * Text template (with variables)
   * Sender address
   * Priority and SMS type
   * Active status
4. Templates are automatically used when sending SMS

#### Payment Status Flow Diagram

```
Customer Checkout
    ↓
Payment Initiated (status: pending)
    ↓
Alif Bank Payment Page
    ↓
Payment Completed
    ↓
Callback Received → Status: completed
    ↓
SMS Sent: Customer ✅ | Manager ✅ | Delivery ✅
    ↓
Admin Reviews Order
    ↓
Admin Sets Status: confirmed
    ↓
SMS Sent: Delivery Team 🚚
    ↓
Order Delivered
```

---

## 🛠 Tech Stack

### Frontend

* **[React 18](https://react.dev/)** - UI library
* **[TypeScript](https://www.typescriptlang.org/)** - Type safety
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
* **[Lucide React](https://lucide.dev/)** - Icon library
* **[React Router v6](https://reactrouter.com/)** - Client-side routing
* **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications
* **[React Helmet Async](https://github.com/staylor/react-helmet-async)** - SEO management
* **[React Markdown](https://remarkjs.github.io/react-markdown/)** - Markdown rendering

### Backend / Infrastructure

* **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  * PostgreSQL database
  * Authentication
  * Real-time subscriptions
  * Storage
  * Edge Functions (Deno runtime)

### Payment Integration

* **Alif Bank** - Payment gateway integration via Supabase Edge Functions

### Tooling

* **[Vite](https://vitejs.dev/)** - Fast dev server + bundler
* **[ESLint](https://eslint.org/)** - Code linting
* **[Prettier](https://prettier.io/)** - Code formatting
* **TypeScript** - Static type checking

---

## 📂 Project Structure

```
sakina-tj/
├── public/                    # Static assets
│   ├── images/               # Product images, logos, etc.
│   ├── icons/                # App icons
│   └── favicon/              # Favicon files
├── src/
│   ├── components/          # React components
│   │   ├── admin/           # Admin panel components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminUsers.tsx
│   │   │   ├── AdminRoleManagement.tsx
│   │   │   ├── AdminOneClickOrders.tsx
│   │   │   ├── AdminPayments.tsx
│   │   │   ├── AdminBlog.tsx
│   │   │   ├── AdminReviews.tsx
│   │   │   ├── AdminCarousel.tsx
│   │   │   └── ...          # Other admin components
│   │   ├── header/          # Desktop & Mobile headers
│   │   ├── hero/            # Hero carousel + slides
│   │   ├── category/        # Category grid + scroll controls
│   │   ├── product/         # Product details, modals, gallery
│   │   ├── cart/            # Cart modal + context
│   │   ├── features/        # Features grid
│   │   ├── benefits/        # Benefits cards
│   │   └── ...              # Other UI blocks
│   ├── contexts/            # Global state management
│   │   └── CartContext.tsx  # Shopping cart state
│   ├── hooks/                # Custom React hooks
│   │   ├── useUserRole.ts   # User role management
│   │   └── useCurrentUser.ts # Current user info
│   ├── layouts/              # Layout components
│   │   ├── PublicLayout.tsx  # Public site layout
│   │   └── AdminLayout.tsx   # Admin panel layout
│   ├── lib/                  # Utilities & API helpers
│   │   ├── supabaseClient.ts # Supabase client
│   │   ├── api.ts            # API functions
│   │   ├── blogApi.ts        # Blog API functions
│   │   ├── paymentUtils.tsx  # Payment utilities
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts          # Utility functions
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx
│   │   ├── BlogPage.tsx
│   │   ├── AboutUsPage.tsx
│   │   └── ...               # Other pages
│   ├── App.tsx               # App root with routing
│   └── main.tsx              # Entry point
├── supabase/
│   ├── functions/            # Supabase Edge Functions
│   │   ├── alif-payment-init/
│   │   ├── alif-payment-callback/
│   │   ├── create-user/
│   │   ├── manage-user/
│   │   └── ...               # Other edge functions
│   └── migrations/           # Database migrations
│       ├── 20250112000000_create_menu_role_permissions.sql
│       └── ...               # Other migrations
├── .env.example              # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ and npm/yarn
* Supabase account and project
* Alif Bank merchant account (for payments)

### 1. Clone the repository

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

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations from `supabase/migrations/` in your Supabase SQL Editor
3. Set up storage buckets for images if needed
4. Deploy Edge Functions (see below)

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alif Bank Payment Integration (for Edge Functions)
ALIF_MERCHANT_ID=your_alif_merchant_id
ALIF_SECRET_KEY=your_alif_secret_key
ALIF_ENCRYPTED_KEY=your_alif_encrypted_key  # For callback validation

# SMS Integration (for Edge Functions)
SMS_API_KEY=your_sms_api_key  # Alif Tech SMS API key
MANAGER_PHONE=+992XXXXXXXXX  # Manager phone (fallback)
DELIVERY_PHONE=+992XXXXXXXXX  # Delivery team phone (fallback)
```

### 5. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy
```

Or deploy individually:

```bash
supabase functions deploy alif-payment-init
supabase functions deploy alif-payment-callback
supabase functions deploy create-user
supabase functions deploy manage-user
# ... deploy other functions
```

### 6. Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Access Admin Panel

1. Navigate to `http://localhost:5173/admin/login`
2. Login with admin credentials
3. The admin panel will be available at `http://localhost:5173/admin`

**Note**: Make sure you have created an admin user in the database. You can use the `create-admin` Edge Function or create one manually in Supabase.

---

## 🔐 Admin Panel Features

### Role-Based Access Control (RBAC)

The admin panel uses a sophisticated RBAC system:

* **Database-Driven Permissions**: Menu visibility and route access are controlled by the `menu_role_permissions` table
* **Dynamic Menu**: Menu items are filtered based on user role and database permissions
* **Route Protection**: All admin routes are protected by `RoleProtectedRoute` component
* **Real-time Updates**: Permission changes are reflected immediately via Supabase real-time subscriptions

### Available Roles

1. **Admin** (`admin`)
   * Full access to all features
   * Can manage users and roles
   * Can configure menu permissions
   * Access to all admin pages

2. **Editor** (`editor`)
   * Content management (products, blog, carousel, etc.)
   * Can create and edit content
   * No access to user management or role configuration

3. **Moderator** (`moderator`)
   * Order and payment management
   * Review moderation
   * Club members management
   * Limited content editing

4. **User** (`user`)
   * Limited access (reserved for future features)

### Managing Permissions

1. Login as admin
2. Navigate to "Управление ролями" (Role Management)
3. Toggle roles for each menu item
4. Click "Сохранить изменения" (Save Changes)
5. Permissions are updated in real-time

---

## 🗄️ Database Schema

### Key Tables

* `products` - Product catalog
* `product_variants` - Product variants with inventory
* `one_click_orders` - One-click orders
* `payments` - Payment records
* `user_profiles` - User profiles with roles
* `menu_role_permissions` - Role-based menu permissions
* `blog_posts` - Blog posts
* `blog_categories` - Blog categories
* `reviews` - Customer reviews
* `carousel_slides` - Hero carousel slides
* `showrooms` - Showroom locations
* `club_members` - Club membership records
* And more...

### Row Level Security (RLS)

All tables have RLS policies enabled:
* Users can only access their own data
* Admins have full access
* Role-based access for different operations

---

## 📱 API & Edge Functions

### Edge Functions

All Edge Functions are located in `supabase/functions/`:

* **Payment Functions**
  * `alif-payment-init`: Initialize payment with Alif Bank
    * Creates payment record in database
    * Generates secure payment request
    * Redirects customer to Alif Bank payment page
  * `alif-payment-callback`: Handle payment webhooks from Alif Bank
    * Validates callback using HMAC-SHA256
    * Updates payment status in database
    * Automatically sends SMS notifications on completion
  * `send-payment-sms`: Send SMS notifications for payment status changes
    * Supports manual status updates (pending, confirmed)
    * Uses customizable SMS templates
    * Sends to appropriate recipients based on status

* **User Management**
  * `create-user`: Create new user (admin only)
  * `manage-user`: Update/delete users (admin only)
  * `create-admin`: Create admin accounts

* **Club Features**
  * `send-club-login-otp`: Send OTP for club login
  * `verify-club-login-otp`: Verify club member OTP

### API Endpoints

The application uses Supabase REST API with RLS policies for all database operations.

---

## 🖼 Screenshots

### Hero Carousel
![Hero Carousel](docs/screenshots/hero.png)

### Category Grid
![Category Grid](docs/screenshots/category.png)

### Cart Modal
![Cart Modal](docs/screenshots/cart.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

---

## ⚙️ Deployment

### Frontend Deployment

#### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist/`
4. Add environment variables in **Netlify Dashboard → Site settings → Build & deploy → Environment**
5. Deploy!

#### Vercel

1. Import your repository into Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist/`
4. Add environment variables
5. Deploy!

### Supabase Deployment

1. All database migrations should be run in Supabase SQL Editor
2. Edge Functions should be deployed using Supabase CLI:
   ```bash
   supabase functions deploy <function-name>
   ```
3. Configure environment secrets for Edge Functions in Supabase Dashboard

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_ANON_KEY`
* Edge Function secrets (in Supabase Dashboard)

---

## 🧑‍💻 Development Workflow

### Branching Strategy

* Use feature branches (`feature/cart`, `fix/responsive-header`)
* Create pull requests for code review
* Follow [Conventional Commits](https://www.conventionalcommits.org/) for clear history

### Code Quality

* **Linting**: Run `npm run lint` before committing
* **Formatting**: Code is automatically formatted with Prettier
* **Type Safety**: TypeScript ensures type safety across the codebase

### Database Migrations

1. Create migration files in `supabase/migrations/`
2. Use descriptive names with timestamps
3. Test migrations in development before production
4. Run migrations in Supabase SQL Editor

### Edge Functions Development

1. Test functions locally using Supabase CLI:
   ```bash
   supabase functions serve <function-name>
   ```
2. Deploy to staging first
3. Test thoroughly before production deployment

---

## 🧪 Testing

Currently, the project focuses on manual testing. Future improvements include:

* Unit tests for components
* Integration tests for API endpoints
* E2E tests for critical user flows

---

## 📦 Future Improvements

* [ ] Advanced product filters and search
* [ ] Wishlist / favorites functionality
* [ ] Internationalization (RU/TJ/EN)
* [ ] Email notifications
* [ ] Advanced analytics and reporting
* [ ] Product recommendations engine
* [ ] Multi-language content management
* [ ] Advanced inventory management
* [ ] Shipping integration
* [ ] Customer support chat
* [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-thing`)
3. Commit your changes (`git commit -m "feat: add new thing"`)
4. Push to the branch (`git push origin feature/new-thing`)
5. Create a Pull Request

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):
* `feat:` - New feature
* `fix:` - Bug fix
* `docs:` - Documentation changes
* `style:` - Code style changes (formatting, etc.)
* `refactor:` - Code refactoring
* `test:` - Adding or updating tests
* `chore:` - Maintenance tasks

---

## 📜 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute with attribution.

---

## 📞 Support

For support, email support@sakina.tj or open an issue in the repository.

---

## 🙏 Acknowledgments

* Built with [React](https://react.dev/)
* Powered by [Supabase](https://supabase.com/)
* Styled with [Tailwind CSS](https://tailwindcss.com/)
* Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for Sakina TJ**

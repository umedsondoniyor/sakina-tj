// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';
import CartModal from './components/CartModal';
import ScrollToTop from './components/ScrollToTop';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';


// Public pages
import HomePage from './pages/HomePage';
import ProductsPage from './components/ProductsPage';
import ProductPage from './components/ProductPage';
import Mattresses from './components/Mattresses';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import OneClickConfirmationPage from './components/OneClickConfirmationPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import AboutUsPage from './pages/AboutUsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

// Admin (unchanged here, but you can do an AdminLayout similarly)
import AdminRoute from './components/admin/AdminRoute';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminReviews from './components/admin/AdminReviews';
import AdminBlog from './components/admin/AdminBlog';
import AdminCarousel from './components/admin/AdminCarousel';
import AdminProductVariants from './components/admin/AdminProductVariants';
import AdminQuiz from './components/admin/AdminQuiz';
import AdminNavigation from './components/admin/AdminNavigation';
import AdminOneClickOrders from './components/admin/AdminOneClickOrders';
import AdminUsers from './components/admin/AdminUsers';
import AdminSmsTemplates from './components/admin/AdminSmsTemplates';
import AdminPayments from './components/admin/AdminPayments';
import AdminAbout from './components/admin/AdminAbout';
import AdminRelatedProducts from './components/admin/AdminRelatedProducts';

// Optional: NotFound
const NotFound = () => <div className="p-8 text-center">Page not found</div>;

function App() {
  return (
    <Router>
      <HelmetProvider>
      <CartProvider>
        {/* Global app-level UI */}
        <Toaster position="top-right" />
        <CartModal />

        {/* 👇 This makes every route change start at the top */}
        <ScrollToTop behavior="smooth" />

        {/* Keep suspense if you later lazy-load pages */}
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          <Routes>
            {/* Public layout wraps all public pages once */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/mattresses" element={<Mattresses />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
            </Route>

            {/* Pages that intentionally skip the public header/footer */}
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/one-click-confirmation/:orderId" element={<OneClickConfirmationPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />

            {/* Admin routes (you can also make an AdminLayout + <Outlet />) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={<AdminRoute><AdminLayout /></AdminRoute>}
            >
              <Route index element={<AdminDashboard />} /> {/* 👈 this renders inside layout */}
              <Route path="carousel" element={<AdminCarousel />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="variants" element={<AdminProductVariants />} />
              <Route path="related-products" element={<AdminRelatedProducts />} />
              <Route path="quiz" element={<AdminQuiz />} />
              <Route path="navigation" element={<AdminNavigation />} />
              <Route path="one-click-orders" element={<AdminOneClickOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sms-templates" element={<AdminSmsTemplates />} />
              <Route path="payments" element={<AdminPayments />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </CartProvider>
    </HelmetProvider>
    </Router>
  );
}

export default App;

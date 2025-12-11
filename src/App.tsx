// src/App.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';
import CartModal from './components/CartModal';
import ScrollToTop from './components/ScrollToTop';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages - Lazy loaded for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./components/ProductsPage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const Mattresses = lazy(() => import('./components/Mattresses'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./components/OrderConfirmationPage'));
const OneClickConfirmationPage = lazy(() => import('./components/OneClickConfirmationPage'));
const PaymentSuccessPage = lazy(() => import('./components/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const DeliveryPaymentPage = lazy(() => import('./pages/DeliveryPaymentPage'));

// Admin - AdminRoute is not lazy loaded as it's a wrapper component
import AdminRoute from './components/admin/AdminRoute';
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./components/admin/AdminProducts'));
const AdminReviews = lazy(() => import('./components/admin/AdminReviews'));
const AdminBlog = lazy(() => import('./components/admin/AdminBlog'));
const AdminCarousel = lazy(() => import('./components/admin/AdminCarousel'));
const AdminProductVariants = lazy(() => import('./components/admin/AdminProductVariants'));
const AdminQuiz = lazy(() => import('./components/admin/AdminQuiz'));
const AdminNavigation = lazy(() => import('./components/admin/AdminNavigation'));
const AdminOneClickOrders = lazy(() => import('./components/admin/AdminOneClickOrders'));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'));
const AdminShowrooms = lazy(() => import('./components/admin/AdminShowrooms'));
const AdminSmsTemplates = lazy(() => import('./components/admin/AdminSmsTemplates'));
const AdminPayments = lazy(() => import('./components/admin/AdminPayments'));
const AdminAbout = lazy(() => import('./components/admin/AdminAbout'));
const AdminRelatedProducts = lazy(() => import('./components/admin/AdminRelatedProducts'));
const AdminServices = lazy(() => import('./components/admin/AdminServices'));
const AdminDeliveryPayment = lazy(() => import('./components/admin/AdminDeliveryPayment'));
const AdminMattresses = lazy(() => import('./components/admin/AdminMattresses'));
const AdminClubMembers = lazy(() => import('./components/admin/AdminClubMembers'));

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

        {/* Loading fallback for lazy-loaded routes */}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        }>
          <Routes>
            {/* Public layout wraps all public pages once */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/mattresses" element={<Mattresses />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/delivery-payment" element={<DeliveryPaymentPage />} />
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
              <Route path="showrooms" element={<AdminShowrooms />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="delivery-payment" element={<AdminDeliveryPayment />} />
              <Route path="mattresses" element={<AdminMattresses />} />
              <Route path="club-members" element={<AdminClubMembers />} />
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

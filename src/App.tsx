import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';
import CartModal from './components/CartModal';
import TopHeader from './components/TopHeader';
import MainHeader from './components/MainHeader';
import HeroCarousel from './components/HeroCarousel';
import CategoryGrid from './components/CategoryGrid';
import ProductPickers from './components/ProductPickers';
import Promotions from './components/Promotions';
import AskonaClub from './components/AskonaClub';
import BestSellers from './components/BestSellers';
import CustomerReviews from './components/CustomerReviews';
import RecommendedProducts from './components/RecommendedProducts';
import ProductionStats from './components/ProductionStats';
import ManufacturingProcess from './components/ManufacturingProcess';
import SleepClubBlog from './components/SleepClubBlog';
import AboutUs from './components/AboutUs';
import Features from './components/Features';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import NotificationAlert from './components/NotificationAlert';
import Benefits from './components/Benefits';
import ProductsPage from './components/ProductsPage';
import ProductPage from './components/ProductPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminReviews from './components/admin/AdminReviews';
import AdminBlog from './components/admin/AdminBlog';
import AdminCarousel from './components/admin/AdminCarousel';
import AdminRoute from './components/admin/AdminRoute';
import AdminLogin from './components/admin/AdminLogin';
import Mattresses from './components/Mattresses';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentCancelPage from './components/PaymentCancelPage';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Toaster position="top-right" />
          <CartModal />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="carousel" element={<AdminCarousel />} />
          </Route>

          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <TopHeader />
                <MainHeader />
                <main>
                  <HeroCarousel />
                  <CategoryGrid />
                  <Features />
                  <ProductPickers />
                  <Benefits />
                  <CustomerReviews />
                  <SleepClubBlog />
                  <AskonaClub />
                  <AboutUs />
                  <ManufacturingProcess />
                  <ContactSection />
                  <NotificationAlert />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/products"
            element={
              <>
                <TopHeader />
                <MainHeader />
                <ProductsPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/products/:id"
            element={
              <>
                <TopHeader />
                <MainHeader />
                <ProductPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/mattresses"
            element={
              <>
                <TopHeader />
                <MainHeader />
                <Mattresses />
                <Footer />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <TopHeader />
                <MainHeader />
                <CheckoutPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/order-confirmation"
            element={<OrderConfirmationPage />}
          />
          <Route
            path="/payment/success"
            element={<PaymentSuccessPage />}
          />
          <Route
            path="/payment/cancel"
            element={<PaymentCancelPage />}
          />
        </Routes>
      </div>
      </CartProvider>
    </Router>
  );
}

export default App;
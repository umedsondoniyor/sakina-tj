import { Outlet, Route, createRoutesFromElements, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminRoute from '../components/admin/AdminRoute';
import RoleProtectedRoute from '../components/admin/RoleProtectedRoute';
import ScrollToTop from '../components/ScrollToTop';
import CartModal from '../components/CartModal';
import HomePage from '../pages/HomePage';
import ProductsPage from '../components/ProductsPage';
import ProductPage from '../components/ProductPage';
import Mattresses from '../components/Mattresses';
import CheckoutPage from '../components/CheckoutPage';
import OrderConfirmationPage from '../components/OrderConfirmationPage';
import OneClickConfirmationPage from '../components/OneClickConfirmationPage';
import PaymentSuccessPage from '../components/PaymentSuccessPage';
import PaymentCancelPage from '../pages/PaymentCancelPage';
import PaymentFailedPage from '../pages/PaymentFailedPage';
import AboutUsPage from '../pages/AboutUsPage';
import BlogPage from '../pages/BlogPage';
import BlogPostPage from '../pages/BlogPostPage';
import ServicesPage from '../pages/ServicesPage';
import DeliveryPaymentPage from '../pages/DeliveryPaymentPage';
import ContactsPage from '../pages/ContactsPage';
import FaqPage from '../pages/FaqPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import AdminFaq from '../components/admin/AdminFaq';
import CustomMattressesPage from '../pages/CustomMattressesPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminReviews from '../components/admin/AdminReviews';
import AdminBlog from '../components/admin/AdminBlog';
import AdminCarousel from '../components/admin/AdminCarousel';
import AdminProductVariants from '../components/admin/AdminProductVariants';
import AdminQuiz from '../components/admin/AdminQuiz';
import AdminNavigation from '../components/admin/AdminNavigation';
import AdminOneClickOrders from '../components/admin/AdminOneClickOrders';
import AdminUsers from '../components/admin/AdminUsers';
import AdminRoleManagement from '../components/admin/AdminRoleManagement';
import AdminShowrooms from '../components/admin/AdminShowrooms';
import AdminSmsTemplates from '../components/admin/AdminSmsTemplates';
import AdminPayments from '../components/admin/AdminPayments';
import AdminAbout from '../components/admin/AdminAbout';
import AdminRelatedProducts from '../components/admin/AdminRelatedProducts';
import AdminServices from '../components/admin/AdminServices';
import AdminDeliveryPayment from '../components/admin/AdminDeliveryPayment';
import AdminMattresses from '../components/admin/AdminMattresses';
import AdminPrivacyPolicy from '../components/admin/AdminPrivacyPolicy';
import AdminFooter from '../components/admin/AdminFooter';
import AdminSeo from '../components/admin/AdminSeo';
import AdminFeatures from '../components/admin/AdminFeatures';
import AdminHomeBenefits from '../components/admin/AdminHomeBenefits';
import AdminManufacturingProcess from '../components/admin/AdminManufacturingProcess';
import AdminClubMembers from '../components/admin/AdminClubMembers';
import AdminClubHomePromo from '../components/admin/AdminClubHomePromo';
import {
  categoryProductsLoader,
  categoryFilterLandingLoader,
  contactsLoader,
  deliveryPaymentLoader,
  faqPageLoader,
  homePageLoader,
  privacyPolicyLoader,
  productPageLoader,
  productsPageLoader,
} from '../loaders/publicLoaders';
import { SiteContactProvider } from '../contexts/SiteContactContext';

const NormalizeTrailingSlash = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
      const normalizedPath = location.pathname.replace(/\/+$/, '');
      navigate(`${normalizedPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
};

const RootRoute = () => (
  <SiteContactProvider>
    <NormalizeTrailingSlash />
    <ScrollToTop behavior="smooth" />
    <CartModal />
    <Outlet />
  </SiteContactProvider>
);

export const appRoutes = createRoutesFromElements(
  <Route element={<RootRoute />}>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} loader={homePageLoader} />
      <Route path="/products" element={<ProductsPage />} loader={productsPageLoader} />
      <Route path="/categories/:slug" element={<ProductsPage />} loader={categoryProductsLoader} />
      <Route path="/categories/:slug/:filterSlug" element={<ProductsPage />} loader={categoryFilterLandingLoader} />
      <Route path="/custom-mattresses" element={<CustomMattressesPage />} />
      <Route path="/categories/mattresses/custom" element={<CustomMattressesPage />} />
      <Route path="/products/:id" element={<ProductPage />} loader={productPageLoader} />
      <Route path="/mattresses" element={<Mattresses />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/delivery-payment" element={<DeliveryPaymentPage />} loader={deliveryPaymentLoader} />
      <Route path="/contacts" element={<ContactsPage />} loader={contactsLoader} />
      <Route path="/faq" element={<FaqPage />} loader={faqPageLoader} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} loader={privacyPolicyLoader} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
    </Route>

    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
    <Route path="/one-click-confirmation/:orderId" element={<OneClickConfirmationPage />} />
    <Route path="/payment/success" element={<PaymentSuccessPage />} />
    <Route path="/payment/cancel" element={<PaymentCancelPage />} />
    <Route path="/payment/failed" element={<PaymentFailedPage />} />

    <Route path="/admin/login" element={<AdminLogin />} />

    <Route
      path="/admin"
      element={(
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      )}
    >
      <Route index element={<AdminDashboard />} />
      <Route path="carousel" element={<RoleProtectedRoute><AdminCarousel /></RoleProtectedRoute>} />
      <Route path="about" element={<RoleProtectedRoute><AdminAbout /></RoleProtectedRoute>} />
      <Route path="reviews" element={<RoleProtectedRoute><AdminReviews /></RoleProtectedRoute>} />
      <Route path="blog" element={<RoleProtectedRoute><AdminBlog /></RoleProtectedRoute>} />
      <Route path="categories" element={<RoleProtectedRoute><AdminCategories /></RoleProtectedRoute>} />
      <Route path="products" element={<RoleProtectedRoute><AdminProducts /></RoleProtectedRoute>} />
      <Route path="variants" element={<RoleProtectedRoute><AdminProductVariants /></RoleProtectedRoute>} />
      <Route path="related-products" element={<RoleProtectedRoute><AdminRelatedProducts /></RoleProtectedRoute>} />
      <Route path="quiz" element={<RoleProtectedRoute><AdminQuiz /></RoleProtectedRoute>} />
      <Route path="navigation" element={<RoleProtectedRoute><AdminNavigation /></RoleProtectedRoute>} />
      <Route path="faq" element={<RoleProtectedRoute><AdminFaq /></RoleProtectedRoute>} />
      <Route path="privacy" element={<RoleProtectedRoute><AdminPrivacyPolicy /></RoleProtectedRoute>} />
      <Route path="footer" element={<RoleProtectedRoute><AdminFooter /></RoleProtectedRoute>} />
      <Route path="seo" element={<RoleProtectedRoute><AdminSeo /></RoleProtectedRoute>} />
      <Route path="features" element={<RoleProtectedRoute><AdminFeatures /></RoleProtectedRoute>} />
      <Route path="home-benefits" element={<RoleProtectedRoute><AdminHomeBenefits /></RoleProtectedRoute>} />
      <Route path="manufacturing-process" element={<RoleProtectedRoute><AdminManufacturingProcess /></RoleProtectedRoute>} />
      <Route path="one-click-orders" element={<RoleProtectedRoute><AdminOneClickOrders /></RoleProtectedRoute>} />
      <Route path="users" element={<RoleProtectedRoute><AdminUsers /></RoleProtectedRoute>} />
      <Route path="role-management" element={<RoleProtectedRoute><AdminRoleManagement /></RoleProtectedRoute>} />
      <Route path="sms-templates" element={<RoleProtectedRoute><AdminSmsTemplates /></RoleProtectedRoute>} />
      <Route path="payments" element={<RoleProtectedRoute><AdminPayments /></RoleProtectedRoute>} />
      <Route path="showrooms" element={<RoleProtectedRoute><AdminShowrooms /></RoleProtectedRoute>} />
      <Route path="services" element={<RoleProtectedRoute><AdminServices /></RoleProtectedRoute>} />
      <Route path="delivery-payment" element={<RoleProtectedRoute><AdminDeliveryPayment /></RoleProtectedRoute>} />
      <Route path="mattresses" element={<RoleProtectedRoute><AdminMattresses /></RoleProtectedRoute>} />
      <Route path="club-members" element={<RoleProtectedRoute><AdminClubMembers /></RoleProtectedRoute>} />
      <Route path="club-home-promo" element={<RoleProtectedRoute><AdminClubHomePromo /></RoleProtectedRoute>} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Route>,
);

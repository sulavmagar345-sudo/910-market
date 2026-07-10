import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import IntroAnimation from './components/IntroAnimation';
import AgeGate from './components/AgeGate';
import AuthModal from './components/AuthModal';
import PromotionalBanner from './components/PromotionalBanner';
import OurStory from './pages/OurStory';
import { AdminRoutes } from '@admin/routes';
import { useAuthStore } from './store/useAuthStore';

function Storefront() {
  return (
    <>
      <AgeGate />
      <AuthModal />
      <PromotionalBanner />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/our-story" element={<OurStory />} />
        </Routes>
      </Layout>
    </>
  );
}

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const initializeAuth = useAuthStore(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!introComplete && (
          <IntroAnimation onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      {introComplete && (
        <BrowserRouter>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/*" element={<Storefront />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import IntroAnimation from './components/IntroAnimation';
import AgeGate from './components/AgeGate';
import AuthModal from './components/AuthModal';
import OurStory from './pages/OurStory';

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {/* 1. Intro Animation blocks the screen initially */}
      <AnimatePresence mode="wait">
        {!introComplete && (
          <IntroAnimation onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      {/* 2. Main App renders behind Age Gate once Intro is done */}
      {introComplete && (
        <>
          <AgeGate />
          <AuthModal />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/our-story" element={<OurStory />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </>
      )}
    </>
  );
}

export default App;

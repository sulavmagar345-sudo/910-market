import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
  priority: number;
}

const DISMISSED_BANNERS_KEY = 'dismissedBanners';
const BANNER_CHECK_INTERVAL = 60000; // Check for new banners every 60 seconds

export default function PromotionalBanner() {
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchActiveBanner();

    // Set up periodic check for new banners
    const interval = setInterval(fetchActiveBanner, BANNER_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveBanner = async () => {
    try {
      // Get dismissed banners from localStorage
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_BANNERS_KEY) || '[]');

      // Build query
      let query = supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true);

      // Only add the 'not in' filter if there are dismissed banners
      if (dismissed.length > 0) {
        query = query.not('id', 'in', `(${dismissed.join(',')})`);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching banner:', error);
        return;
      }

      if (data) {
        // Check if banner is within date range
        const now = new Date();
        const startDate = data.start_date ? new Date(data.start_date) : null;
        const endDate = data.end_date ? new Date(data.end_date) : null;

        const isWithinDateRange =
          (!startDate || startDate <= now) && (!endDate || endDate >= now);

        if (isWithinDateRange) {
          setActiveBanner(data);
          setIsVisible(true);
        }
      }
    } catch (err) {
      console.error('Error in fetchActiveBanner:', err);
    }
  };

  const handleDismiss = (dontShowAgain: boolean = false) => {
    if (dontShowAgain && activeBanner) {
      // Add to dismissed list in localStorage
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_BANNERS_KEY) || '[]');
      dismissed.push(activeBanner.id);
      localStorage.setItem(DISMISSED_BANNERS_KEY, JSON.stringify(dismissed));
    }

    setIsVisible(false);
    setTimeout(() => setActiveBanner(null), 300);
  };

  const handleLinkClick = () => {
    if (activeBanner?.link_url) {
      window.open(activeBanner.link_url, '_blank', 'noopener,noreferrer');
    }
    handleDismiss(false);
  };

  if (!activeBanner) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => handleDismiss(false)}
          />

          {/* Banner Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => handleDismiss(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Image */}
            <div 
              className="relative w-full cursor-pointer group"
              onClick={() => activeBanner.link_url && handleLinkClick()}
            >
              <img
                src={activeBanner.image_url}
                alt={activeBanner.title}
                className="w-full h-auto object-cover max-h-[70vh]"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/1200x400?text=Promotional+Banner';
                }}
              />
              
              {/* Gradient Overlay (if there's a link) */}
              {activeBanner.link_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">{activeBanner.title}</h3>
                    {activeBanner.description && (
                      <p className="text-sm text-white/90 mb-4">{activeBanner.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                  onClick={() => handleDismiss(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors order-2 sm:order-1"
                >
                  Don't show this again
                </button>
                <div className="flex gap-3 order-1 sm:order-2">
                  <button
                    onClick={() => handleDismiss(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                  {activeBanner.link_url && (
                    <button
                      onClick={handleLinkClick}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                    >
                      {activeBanner.link_text || 'Learn More'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgeGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // Check if they've already verified their age in this session
    const verified = sessionStorage.getItem('ageVerified');
    if (!verified) {
      // Small delay to allow the intro to fully finish before popping up
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleYes = () => {
    sessionStorage.setItem('ageVerified', 'true');
    setIsOpen(false);
  };

  const handleNo = () => {
    setDenied(true);
  };

  if (!isOpen && !denied) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="bg-surface-bright border border-secondary/20 p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />

          {denied ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[40px] text-red-500">block</span>
              </div>
              <h2 className="font-headline-lg text-3xl text-primary font-bold mb-4 tracking-tight">Access Denied</h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                You must be of legal drinking age to enter 9/10 Market. Please return when you meet the legal requirements.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="w-20 h-20 bg-pale-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-secondary/30">
                <span className="material-symbols-outlined text-[40px] text-secondary">verified_user</span>
              </div>
              <h2 className="font-headline-lg text-3xl text-primary font-bold mb-4 tracking-tight">Are you 18 or older?</h2>
              <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed">
                You must be of legal drinking age to enter this site. Please verify your age to continue shopping our premium selection.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleNo}
                  className="px-8 py-3.5 rounded border border-stone-gray font-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-stone-gray/10 transition-colors w-full sm:w-auto"
                >
                  No, I am under 18
                </button>
                <button
                  onClick={handleYes}
                  className="px-8 py-3.5 rounded bg-secondary text-white font-label-md uppercase tracking-widest hover:bg-[#d38b42] transition-all shadow-md w-full sm:w-auto hover:shadow-lg"
                >
                  Yes, I am 18+
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

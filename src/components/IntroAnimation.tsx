import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show welcome text for 2.5 seconds, then fade out the whole intro
    const t = setTimeout(() => {
      setVisible(false);
      // Wait for exit animation to finish before unmounting from parent
      setTimeout(onComplete, 800);
    }, 2500);
    
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-bright overflow-hidden"
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Premium Background Elements */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
               style={{
                 backgroundImage: 'radial-gradient(circle at center, #c9a84c 1px, transparent 1px)',
                 backgroundSize: '32px 32px'
               }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-bright via-transparent to-surface-bright pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-center">
            
            {/* Welcome Text Only */}
            <motion.div
              initial={{ y: 30, opacity: 0, filter: 'blur(5px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute flex flex-col items-center"
            >
              <span className="font-label-md text-secondary uppercase tracking-[0.4em] text-sm mb-4 block">
                Welcome to
              </span>
              <h1 className="font-headline-lg text-5xl md:text-7xl text-primary font-bold">
                9/10 Market
              </h1>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-secondary to-transparent mt-8" />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

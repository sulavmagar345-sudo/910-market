import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthModal() {
  const { error, isAuthModalOpen, authView, otpStep, closeAuthModal, setAuthView, login, signup, verifyOtp } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  // Reset form when switching views
  const switchView = (view: 'login' | 'signup') => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp(['', '', '', '']);
    setAuthView(view);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authView === 'login') {
      login(email, password);
    } else {
      signup(name, email, password, phone);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp(otp.join(''));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // Only take last char
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeAuthModal}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-gray/50"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 bg-surface-container-low text-on-surface-variant rounded-full hover:bg-stone-gray/20 hover:text-primary transition-colors z-10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          
          <div className="p-8 md:p-10">
            
            {/* OTP Step View */}
            {otpStep ? (
              <div className="animate-fade-in text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                  <span className="material-symbols-outlined text-[32px]">dialpad</span>
                </div>
                <h2 className="font-headline-md text-3xl text-primary font-bold tracking-tight mb-2">
                  Verify Number
                </h2>
                <p className="font-body-md text-on-surface-variant text-sm mb-8">
                  We've sent a 4-digit code to <br/><span className="font-bold text-primary">{phone}</span>
                </p>
                
                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-14 h-16 text-center text-2xl font-bold bg-surface-bright border border-stone-gray rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                        maxLength={1}
                        required
                      />
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white font-label-md uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
                  >
                    Verify & Continue
                  </button>
                </form>
                
                <p className="mt-6 font-body-md text-sm text-on-surface-variant">
                  Didn't receive the code? <button className="text-secondary font-bold hover:underline ml-1">Resend</button>
                </p>
              </div>
            ) : (
              /* Regular Auth View (Email / Phone) */
              <div className="animate-fade-in">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="font-headline-md text-3xl text-primary font-bold tracking-tight mb-2">
                    {authView === 'login' ? 'Welcome Back' : 'Join 9/10 Market'}
                  </h2>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    {authView === 'login' 
                      ? 'Sign in to access your premium collection.'
                      : 'Create an account for exclusive access.'}
                  </p>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
                    {error}
                  </div>
                )}
                
                {/* Main Auth Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-5 animate-fade-in mt-6">
                  {authView === 'signup' && (
                    <>
                      <div>
                        <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 text-xs">Full Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-surface-bright border border-stone-gray rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 text-xs">Mobile Number</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 bg-surface-container-low border border-r-0 border-stone-gray rounded-l-lg text-on-surface-variant font-body-md font-bold">
                            +977
                          </span>
                          <input
                            type="tel"
                            required
                            minLength={10}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="Please enter exactly 10 digits"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            className="flex-1 w-full p-3.5 bg-surface-bright border border-stone-gray rounded-r-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md"
                            placeholder="98XXXXXXXX"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2 text-xs">Email Address</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-surface-bright border border-stone-gray rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant text-xs">Password</label>
                      {authView === 'login' && <a href="#" className="font-label-sm text-xs text-secondary hover:underline">Forgot?</a>}
                    </div>
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 bg-surface-bright border border-stone-gray rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md" placeholder="••••••••" />
                  </div>
                  
                  <button type="submit" className="w-full py-4 mt-2 bg-primary text-white font-label-md uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]">
                    {authView === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="font-body-md text-sm text-on-surface-variant">
                    {authView === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => switchView(authView === 'login' ? 'signup' : 'login')}
                      className="text-secondary font-bold hover:underline"
                    >
                      {authView === 'login' ? 'Sign up' : 'Log in instead'}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

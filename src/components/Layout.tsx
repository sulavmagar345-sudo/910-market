import { type ReactNode, useState, useRef, useCallback } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import CartSidebar from './CartSidebar';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const ANNOUNCEMENT_TEXT = "Fast Delivery inside Ring Road within 45 minutes   •   Get 10% Off on your first order with code WELCOME   •   100% Authentic Spirits & Secure Checkout   •   ";

interface LayoutProps {
  children: ReactNode;
}

const navCategories = [
  {
    label: 'Whisky',
    items: ['Single Malt', 'Blended Scotch', 'Bourbon / American', 'Irish Whiskey', 'Japanese Whisky', 'Nepali Whisky (Old Durbar)'],
  },
  {
    label: 'Vodka',
    items: ['Plain / Pure Vodka', 'Flavoured Vodka', 'Domestic Premium (8848, Ruslan)', 'Imported (Grey Goose, Absolut)'],
  },
  {
    label: 'Beer',
    items: ['Lager & Pilsner', 'Ale & IPA', 'Stout & Porter', 'Wheat Beer', 'Craft Beer', 'Domestic (Nepal Ice, Gorkha)'],
  },
  {
    label: 'Wine',
    items: ['Red Wine (Cabernet, Merlot)', 'White Wine (Chardonnay, Sauvignon)', 'Rosé Wine', 'Sparkling & Champagne', 'Port & Dessert Wine'],
  },
  {
    label: 'Rum',
    items: ['Dark Rum (Khukuri XXX)', 'White & Silver Rum', 'Spiced Rum', 'Aged / Premium Rum'],
  },
  {
    label: 'Brandy & Cognac',
    items: ['VS (Very Special)', 'VSOP (Very Superior Old Pale)', 'XO (Extra Old)', 'Cognac (Hennessy, Remy Martin)', 'Domestic Brandy'],
  },
  {
    label: 'Gin',
    items: ['London Dry Gin', 'Botanical Gin', 'Flavoured & Pink Gin', 'Nepali Craft Gin'],
  },
  {
    label: 'Tequila',
    items: ['Blanco / Silver', 'Reposado', 'Añejo', 'Mezcal', 'Premium Tequila (Don Julio, Patron)'],
  },
  {
    label: 'Liqueurs',
    items: ['Cream Liqueur (Baileys)', 'Coffee Liqueur (Kahlúa)', 'Fruit Liqueur', 'Herbal & Bitter Liqueur', 'Schnapps'],
  },
  {
    label: 'Sake & Asian',
    items: ['Japanese Sake', 'Soju (Korean)', 'Baijiu (Chinese)', 'Mao Tai', 'Rice Wine'],
  },
  {
    label: 'Cider & RTD',
    items: ['Apple Cider', 'Pear Cider', 'Hard Seltzer', 'Ready-to-Drink Cocktails', 'Alcopops'],
  },
  { 
    label: 'Mixers', 
    items: ['Tonic Water', 'Ginger Ale', 'Club Soda', 'Juices', 'Syrups & Bitters', 'Cocktail Mixes'] 
  },
  {
    label: 'Groceries',
    items: ['Snacks & Chips', 'Chocolates & Sweets', 'Energy Drinks', 'Soft Drinks & Juices', 'Soda & Water']
  },
];

function NavItem({ label, items, isDragging }: { label: string; items: string[]; isDragging?: React.MutableRefObject<boolean> }) {
  const [open, setOpen] = useState(false);
  const hasDropdown = items.length > 0;

  return (
    <li
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button 
        onClick={() => {
          // suppress open/close if user was dragging
          if (isDragging?.current) return;
          setOpen(!open);
        }}
        className="flex items-center gap-1 font-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors py-1 whitespace-nowrap text-[11px] md:text-xs"
      >
        {label}
        {hasDropdown && (
          <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        )}
      </button>

      {hasDropdown && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-full left-0 mt-2 bg-white border border-stone-gray rounded-lg shadow-xl py-2 min-w-[200px] z-[80]"
            >
              {items.map((item) => (
                <Link
                  key={item}
                  to="/"
                  className="block px-5 py-2.5 font-body-md text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors whitespace-nowrap"
                >
                  {item}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { toggleCart, items } = useCartStore();
  const { user, openAuthModal, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const isCheckout = location.pathname === '/checkout';
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Drag-scroll for the nav strip
  const navScrollRef = useRef<HTMLUListElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = false;
    startX.current = e.pageX - (navScrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = navScrollRef.current?.scrollLeft ?? 0;
    navScrollRef.current?.classList.add('cursor-grabbing');
    // listen on window so drag works even if mouse leaves the element
    const onMouseMove = (ev: MouseEvent) => {
      const x = ev.pageX - (navScrollRef.current?.offsetLeft ?? 0);
      const walk = (x - startX.current) * 1.2;
      if (Math.abs(walk) > 4) isDragging.current = true;
      if (navScrollRef.current) navScrollRef.current.scrollLeft = scrollLeft.current - walk;
    };
    const onMouseUp = () => {
      navScrollRef.current?.classList.remove('cursor-grabbing');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm flex flex-col">
        {/* Scrolling Marquee Banner */}
        <div className="bg-primary text-white h-8 flex items-center overflow-hidden w-full relative z-50 whitespace-nowrap">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 20
            }}
            className="flex font-label-sm uppercase tracking-widest text-[10px] md:text-xs"
          >
            {/* We render the text twice to create a seamless infinite loop */}
            <span className="px-4">{ANNOUNCEMENT_TEXT}</span>
            <span className="px-4">{ANNOUNCEMENT_TEXT}</span>
          </motion.div>
        </div>

        <div className="flex justify-between items-center px-4 md:px-16 h-20 max-w-[1280px] w-full mx-auto border-b border-stone-gray/50">
          {/* Logo */}
          <Link to="/" className="font-headline-md text-3xl font-bold text-primary tracking-tighter transition-transform duration-200 active:scale-95 shrink-0">
            9/10 <span className="text-sm font-label-md uppercase tracking-widest text-secondary block -mt-2">Store</span>
          </Link>

          {/* Search Bar - hidden on checkout */}
          {!isCheckout && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 items-center bg-surface-container-low rounded border border-stone-gray px-4 py-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-full text-on-surface"
              />
            </div>
          )}

          {/* Checkout title */}
          {isCheckout && (
            <span className="hidden md:block font-headline-md text-lg text-on-surface-variant tracking-wide mx-auto">Secure Checkout</span>
          )}

          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
            {!isCheckout && (
              <button 
                aria-label="Search" 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden text-on-surface-variant hover:text-primary p-2"
              >
                <span className="material-symbols-outlined text-[24px]">{isMobileSearchOpen ? 'close' : 'search'}</span>
              </button>
            )}
            <button
              onClick={toggleCart}
              aria-label="Shopping Bag"
              className="relative text-on-surface-variant hover:text-primary transition-colors hover:bg-pale-gold/10 p-2 rounded-full duration-300"
            >
              <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
            <div className="relative group">
              <button 
                aria-label="Profile" 
                onClick={() => (!user || user.role) ? openAuthModal('login') : null}
                className="text-on-surface-variant hover:text-primary transition-colors hover:bg-pale-gold/10 p-2 rounded-full duration-300 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[24px]">person</span>
                {user && !user.role && <span className="hidden md:block font-label-sm text-xs font-bold text-primary">{user.name}</span>}
              </button>
              
              {user && !user.role && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-gray rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] py-2">
                  <div className="px-4 py-2 border-b border-stone-gray/50 mb-2">
                    <p className="font-label-md text-primary font-bold">{user.name}</p>
                    <p className="font-body-md text-xs text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 font-body-md text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
                    My Orders
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 font-body-md text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        <AnimatePresence>
          {isMobileSearchOpen && !isCheckout && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-stone-gray bg-white overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center bg-surface-container-low rounded border border-stone-gray px-4 py-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-full text-on-surface"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub Navigation - HIDDEN on checkout */}
        {!isCheckout && (
          <div className="border-t border-stone-gray bg-surface-bright py-2.5 relative">
            {/* Left fade edge */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-surface-bright to-transparent z-10" />
            {/* Right fade edge */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-surface-bright to-transparent z-10" />

            <ul
              ref={navScrollRef}
              onMouseDown={onMouseDown}
              className="flex items-center gap-6 md:gap-8 max-w-[1280px] mx-auto px-6 md:px-16 overflow-x-auto whitespace-nowrap select-none cursor-grab scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {navCategories.map((cat) => (
                <NavItem key={cat.label} label={cat.label} items={cat.items} isDragging={isDragging} />
              ))}
            </ul>
          </div>
        )}
      </nav>

      <main className={`${isCheckout ? 'pt-[112px]' : 'pt-[162px] md:pt-[168px]'} min-h-screen flex flex-col`}>
        {children}
      </main>

      <Footer isCheckout={isCheckout} />
      <CartSidebar />
    </>
  );
}

function Footer({ isCheckout }: { isCheckout: boolean }) {
  if (isCheckout) return null;

  return (
    <footer className="bg-surface-bright w-full py-16 border-t border-stone-gray mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-4 md:px-16 max-w-[1280px] mx-auto">
        <div className="col-span-1 md:col-span-1">
          <span className="font-headline-lg text-3xl text-primary block mb-4">9/10 Store</span>
          <p className="font-body-md text-sm text-on-surface-variant max-w-xs leading-relaxed">
            Crafting exceptional spirits rooted in the heritage of the Himalayas since 1959. Delivering fastest on-time service.
          </p>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-md text-sm uppercase tracking-widest text-primary mb-6">Categories</h4>
          <ul className="space-y-3">
            {['Liquor', 'Grocery', 'Mixers'].map((l) => (
              <li key={l}><Link className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors" to="/">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-md text-sm uppercase tracking-widest text-primary mb-6">Support</h4>
          <ul className="space-y-3">
            {['Shipping & Delivery', 'Privacy Policy', 'Terms of Service'].map((l) => (
              <li key={l}><Link className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors" to="/">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-md text-sm uppercase tracking-widest text-primary mb-6">Connect</h4>
          <div className="flex space-x-4">
            <a className="p-2 bg-surface-container-low rounded-full text-on-surface-variant hover:text-secondary transition-all" href="#">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </a>
            <a className="p-2 bg-surface-container-low rounded-full text-on-surface-variant hover:text-secondary transition-all" href="#">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-stone-gray/50 px-4 md:px-16 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="font-body-md text-xs text-on-surface-variant">© 2024 9/10 Store. Crafted in the peaks of Nepal.</p>
        <p className="font-body-md text-xs text-on-surface-variant mt-2 md:mt-0 font-bold uppercase tracking-wider">Please drink responsibly.</p>
      </div>
    </footer>
  );
}

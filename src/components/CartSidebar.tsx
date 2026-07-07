import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { items, isCartOpen, toggleCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-surface z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-gray">
              <h2 className="font-headline-md text-2xl text-primary font-bold">Your Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center text-on-surface-variant mt-10">
                  <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">shopping_bag</span>
                  <p className="font-body-md">Your cart is currently empty.</p>
                  <button 
                    onClick={toggleCart}
                    className="mt-6 text-secondary font-label-md uppercase tracking-widest hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-stone-gray/50 pb-6">
                    {/* Product Image/Icon */}
                    <div className="w-20 h-24 bg-white border border-stone-gray rounded flex items-center justify-center shrink-0">
                      {item.type === 'image' ? (
                        <div 
                          className="w-full h-full bg-contain bg-no-repeat bg-center m-2"
                          style={{ backgroundImage: `url('${item.bgUrl}')` }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[32px] text-stone-gray/80">{item.icon}</span>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">{item.category}</span>
                          <h3 className="font-headline-md text-sm text-primary font-bold line-clamp-2">{item.name}</h3>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-stone-gray rounded">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="w-8 text-center font-body-md text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                        <span className="font-label-md font-bold text-secondary">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-gray bg-surface-bright">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-body-lg text-on-surface-variant">Subtotal</span>
                  <span className="font-headline-md text-xl text-primary font-bold">रू {getTotal().toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary text-white font-label-md uppercase tracking-widest rounded hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

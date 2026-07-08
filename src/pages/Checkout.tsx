import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { items, getTotal, toggleCart, clearCart } = useCartStore();
  const { user, openAuthModal } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handlePayment = async () => {
    setIsSubmitting(true);
    try {
      const formData = formRef.current ? new FormData(formRef.current) : null;
      const firstName = formData?.get('firstName') as string || '';
      const lastName = formData?.get('lastName') as string || '';
      const email = formData?.get('email') as string || user?.email || '';
      const phone = formData?.get('phone') as string || user?.phone || '';
      const address = formData?.get('address') as string || '';
      const city = formData?.get('city') as string || '';

      const orderPayload = {
        p_customer_id: user?.id || null,
        p_customer_name: `${firstName} ${lastName}`.trim() || user?.name || 'Guest',
        p_customer_email: email,
        p_customer_phone: phone,
        p_shipping_address: { street_address: address, city, full_name: `${firstName} ${lastName}`.trim(), phone },
        p_payment_method: paymentMethod === 'cod' ? 'cod' : 'esewa',
        p_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const { data: orderResponse, error: orderError } = await supabase.rpc('create_secure_order', orderPayload);

      if (orderError) throw orderError;
      if (!orderResponse) throw new Error("No response from server");

      setOrderId(orderResponse.order_number);
      setStep(3);
      clearCart();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Order could not be placed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (items.length === 0 && step !== 3) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <span className="material-symbols-outlined text-[64px] text-stone-gray mb-4">shopping_cart_checkout</span>
        <h2 className="font-headline-lg text-3xl text-primary mb-4">Your cart is empty</h2>
        <p className="font-body-md text-on-surface-variant mb-8 text-center">Add some items to your cart before proceeding to checkout.</p>
        <Link 
          to="/" 
          className="px-8 py-3 bg-secondary text-white font-label-md uppercase tracking-widest rounded hover:bg-secondary/90 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface-container-low py-8">
      {/* Back to cart link */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 mb-6">
        <button
          onClick={toggleCart}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Cart
        </button>
      </div>
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Checkout Flow */}
        <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-stone-gray p-6 md:p-10">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-10 border-b border-stone-gray pb-6">
            <div className={`flex items-center space-x-2 ${step === 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>1</span>
              <span className="font-label-md uppercase tracking-wider font-bold hidden md:block">Shipping</span>
            </div>
            <div className="h-px bg-stone-gray flex-1 mx-4"></div>
            <div className={`flex items-center space-x-2 ${step === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>2</span>
              <span className="font-label-md uppercase tracking-wider font-bold hidden md:block">Payment</span>
            </div>
            <div className="h-px bg-stone-gray flex-1 mx-4"></div>
            <div className={`flex items-center space-x-2 ${step === 3 ? 'text-primary' : (step > 3 ? 'text-primary opacity-50' : 'text-on-surface-variant opacity-50')}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>3</span>
              <span className="font-label-md uppercase tracking-wider font-bold hidden md:block">Confirmation</span>
            </div>
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-md text-2xl text-primary font-bold">Shipping Information</h2>
                {!user && (
                  <button 
                    onClick={() => openAuthModal('login')}
                    className="font-label-sm text-secondary hover:underline text-xs tracking-widest uppercase"
                  >
                    Log in for faster checkout
                  </button>
                )}
              </div>
              <form ref={formRef} className="space-y-6" onSubmit={(e) => { 
                e.preventDefault(); 
                setStep(2); 
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">First Name</label>
                    <input required name="firstName" type="text" className="w-full p-3 border border-stone-gray rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Last Name</label>
                    <input required name="lastName" type="text" className="w-full p-3 border border-stone-gray rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                  </div>
                </div>
                
                <div>
                  <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
                  <input required name="email" type="email" className="w-full p-3 border border-stone-gray rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Delivery Address</label>
                  <input required name="address" type="text" className="w-full p-3 border border-stone-gray rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="Street address, apartment, suite, etc." />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">City</label>
                    <input required name="city" type="text" className="w-full p-3 border border-stone-gray rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Phone Number</label>
                    <input required name="phone" type="tel" className="w-full p-3 border border-stone-gray rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button type="submit" className="w-full py-4 bg-primary text-white font-label-md uppercase tracking-widest rounded hover:bg-primary/90 transition-colors shadow-md">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-headline-md text-2xl text-primary mb-6 font-bold">Payment Method</h2>
              <div className="space-y-4 mb-8">
                {/* Payment Options (Mockup) */}
                {/* eSewa */}
                <label className={`flex items-center p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'esewa' ? 'border-secondary bg-pale-gold/10' : 'border-stone-gray hover:border-secondary'}`}>
                  <input type="radio" name="payment" value="esewa" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} className="text-secondary focus:ring-secondary" />
                  <div className="ml-4 flex-1">
                    <span className="font-label-md font-bold text-primary block">eSewa</span>
                    <span className="font-body-md text-sm text-on-surface-variant">Pay securely via eSewa digital wallet</span>
                  </div>
                  <img src="https://esewa.com.np/common/images/esewa-logo.png" alt="eSewa" className="h-6 object-contain opacity-80" />
                </label>
                
                {/* Fonepay */}
                <label className={`flex items-center p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'fonepay' ? 'border-secondary bg-pale-gold/10' : 'border-stone-gray hover:border-secondary'}`}>
                  <input type="radio" name="payment" value="fonepay" checked={paymentMethod === 'fonepay'} onChange={() => setPaymentMethod('fonepay')} className="text-secondary focus:ring-secondary" />
                  <div className="ml-4 flex-1">
                    <span className="font-label-md font-bold text-primary block">Fonepay</span>
                    <span className="font-body-md text-sm text-on-surface-variant">Scan to pay with Fonepay supported apps</span>
                  </div>
                  <span className="font-bold text-primary italic text-lg tracking-tight">fone<span className="text-red-500">pay</span></span>
                </label>
                
                {/* Cash on Delivery */}
                <label className={`flex items-center p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-secondary bg-pale-gold/10' : 'border-stone-gray hover:border-secondary'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-secondary focus:ring-secondary" />
                  <div className="ml-4 flex-1">
                    <span className="font-label-md font-bold text-primary block">Cash on Delivery</span>
                    <span className="font-body-md text-sm text-on-surface-variant">Pay when you receive the order</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[28px]">local_shipping</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="px-6 py-4 border border-stone-gray text-primary font-label-md uppercase tracking-widest rounded hover:bg-surface-container-low transition-colors">
                  Back
                </button>
                <button onClick={handlePayment} disabled={isSubmitting} className="flex-1 py-4 bg-secondary text-white font-label-md uppercase tracking-widest rounded hover:bg-secondary/90 transition-colors shadow-md flex justify-center items-center disabled:opacity-60">
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <span className="material-symbols-outlined mr-2">local_shipping</span> Place Order (COD)
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">lock</span> Pay रू {getTotal().toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center py-12">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[48px] text-green-500">check_circle</span>
              </div>
              <h2 className="font-headline-lg text-4xl text-primary mb-2 font-bold tracking-tight">Order Confirmed!</h2>
              <p className="font-body-md text-on-surface-variant mb-4 leading-relaxed">Thank you for your purchase. We are processing your order.</p>
              
              <div className="font-label-md font-bold text-primary mb-10 bg-surface-container-low inline-block px-6 py-3 rounded-lg border border-stone-gray/50 shadow-sm">
                Order ID: <span className="text-secondary">{orderId}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/" className="px-8 py-3.5 border border-stone-gray text-primary font-label-md uppercase tracking-widest rounded hover:bg-surface-container-low transition-colors w-full sm:w-auto">
                  Continue Shopping
                </Link>
                <button className="px-8 py-3.5 bg-secondary text-white font-label-md uppercase tracking-widest rounded hover:bg-[#d38b42] transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  Track Your Order
                </button>
              </div>
            </div>
          )}
          
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm border border-stone-gray p-6 sticky top-28">
            <h3 className="font-headline-md text-xl text-primary font-bold mb-6 border-b border-stone-gray pb-4">Order Summary</h3>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-container-low rounded flex items-center justify-center shrink-0 border border-stone-gray/50">
                      {item.type === 'image' ? (
                        <div 
                          className="w-full h-full bg-contain bg-no-repeat bg-center m-1"
                          style={{ backgroundImage: `url('${item.bgUrl}')` }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[20px] text-stone-gray/80">{item.icon}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-body-md text-primary font-bold line-clamp-1">{item.name}</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-label-md font-bold text-primary whitespace-nowrap">रू {(item.numericPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-stone-gray pt-4 space-y-3">
              <div className="flex justify-between font-body-md text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>रू {getTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-body-md text-sm text-on-surface-variant">
                <span>Shipping</span>
                <span>Calculated next step</span>
              </div>
              <div className="flex justify-between items-center border-t border-stone-gray pt-4 mt-2">
                <span className="font-headline-md text-lg text-primary font-bold">Total</span>
                <span className="font-headline-md text-2xl text-secondary font-bold">रू {getTotal().toLocaleString()}</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

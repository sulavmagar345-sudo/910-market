import { useEffect, useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const products = [
  {
    id: 1,
    category: 'Vodka',
    name: '8848 Premium Vodka',
    price: 'रू 2,200',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmRYCJuGyE40jVct427zTtANBQZKMt4NCbz11WEhx6HEE9543gB5-9oZdsEdA70oWxZ6Sjd1eGMwnywnFvEQ3EY20S49N-IESF52eOTHBPoeELYkqFZ6Xovz1FtvAI0PJ1Laymbbzi_LAF12hwG0Fwnq9omUvOtvmymLxfSleO0pQUdyXsSlMrYIfbg2s5vZX8mPDnmKmXA_ySovZi4vvM6Mf7cBpsb0jASeWT-J3ijs_9ZHXDq97',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 2,
    category: 'Rum',
    name: 'Khukuri XXX Rum',
    price: 'रू 1,850',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFCorgSAiCCKxziqu3ZtiQm_9_52RmQW1OkrhR-Xq24xbbPJflQNVjsdCK2IzX0FtTciq1nVT-7sfldSMWwoYD2IVVFeNkOk3OF6EGjUCcVO1Az2W21HzUjiix4yZcmG-AATVhDF2JMIthPGi8S0PENc18cLG_6ynBL5BUHa27aC-b0uCk_S_kT1Xzl09l6NJS2t4VtACjsbgDZ5SEmJ14vMD0ILS-EjJL83JkDsLDxpD8yZqcTWbE',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 3,
    category: 'Vodka',
    name: 'Ruslan Vodka',
    price: 'रू 1,400',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJm86E1tLSppraf2oUixf2Pa5gb5jZ1jtXZYv47EjqyEIboB89kk2l60gnFPkal_RoqU85OIOLxCNzBeTwyQtycajAPLiMkdwo0JQYLu28L_UVwFUOYqhpIbNIwpJlzEw3bHqkVtCXEwTDVxoPLf2G52SzZA-csLFh2sfM630O7g1l9v4pQGpq1pJ8z-5dGA0qQVk_6J0obDg1go3Bm35hU8bbACMr0kajflgis0a8w-Mt6Qmbl4RD',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 4,
    category: 'Wine',
    name: 'Highland Reserve White',
    price: 'रू 2,800',
    volume: '750 ML',
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJgu9c_Q4QGwZI5BGq_QtNhM594vJDCNLNTjyrcSPNNykKBmSBsaPZEyDIBu5cC_jbySnpKw3jDWzuS7WjLKhJcG_O01-FRML6oWnHR0y-QgoKggWmjBdVMzGlftUk9_Hb1B-yKkbN6yNjhmsWmVoWV7iyayHqn7JsW772-qmAeT9FSN6i7VQdkIBz1bJtRt0ZwHE9ZprhYXkKMmiI2bQeBmGcSFqQLRkQrGsHvNdq0iekqkoGCt_O',
    bgPosition: 'center',
    type: 'image',
  },
  {
    id: 5,
    category: 'Whisky',
    name: 'Old Durbar Black',
    price: 'रू 3,450',
    volume: '750 ML',
    icon: 'liquor',
    type: 'icon',
  },
];

const bannerSlides = [
  { img: '/banner1.png', eyebrow: 'Experience 9/10', title: 'Elevating the Spirit of the Peaks', cta: 'Shop Now' },
  { img: '/banner2.png', eyebrow: 'The Legacy', title: 'Crafted Himalayan Heritage', cta: 'Our Story' },
  { img: '/banner3.png', eyebrow: 'Distilled to Perfection', title: 'The Art of Distillation', cta: 'Explore The Vault' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<number | string>>(new Set());
  const [quantities, setQuantities] = useState<Record<number | string, number>>({});
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  // Fetch live products from DB; fall back to hardcoded if none exist
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(url), categories(name)')
        .eq('is_active', true)
        .eq('status', 'active');
      if (!error && data && data.length > 0) {
        setLiveProducts(data.map((p) => ({
          id: p.id,
          category: p.categories?.name || 'Uncategorized',
          name: p.name,
          price: `\u0930\u0942 ${Number(p.price).toLocaleString()}`,
          volume: '750 ML',
          bgUrl: p.product_images?.[0]?.url || '',
          bgPosition: 'center',
          type: p.product_images?.[0]?.url ? 'image' : 'icon',
          icon: 'liquor',
        })));
      }
    }
    fetchProducts();
  }, []);

  // Combine live DB products with the demo products for the presentation
  const displayProducts = [...liveProducts, ...products];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleQtyChange = (id: number | string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] || 1;
    
    // Add multiple times to handle the requested quantity
    for(let i=0; i<qty; i++){
      addItem(product);
    }
    
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  return (
    <>
      {/* Hero Banner Carousel */}
      <section className="relative h-[220px] md:h-[380px] overflow-hidden bg-primary w-full">
        <div
          className="flex h-full w-[300%] transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
        >
          {bannerSlides.map((slide, idx) => (
            <div key={idx} className="w-1/3 h-full relative shrink-0">
              <img
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                src={slide.img}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida/AP1WRLv_zAoAvk8Q4Y_QekACqBIKi1u3tqaDDvlxPnTSR3eDmMAhDy3G-T7H857KLZHa5yvlFYH_EEM80gJteQRmn2IOr7qtOnT2ah7pPJ1edD-qpPXMQaYm3o_MoSYdFmmlWnmAqJZSsBRfnXHc0M0DVZBzVljBaGGrwMKIFiwe_RjvUsade-x61iBYokp2uDyj0hrh2_g4F09CY-BjFU9iJ-Crkcr4n1cjIr1WaPfUJyopqA8ZkFQXo360_GI'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent flex flex-col justify-center px-6 md:px-20">
                <div className="max-w-xl">
                  <span className="text-secondary font-label-md uppercase tracking-[0.2em] mb-2 block text-sm">
                    {slide.eyebrow}
                  </span>
                  <h2 className="font-display-lg text-2xl md:text-5xl text-white mb-5 tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                  <button 
                    onClick={() => {
                      if (slide.cta === 'Our Story') navigate('/our-story');
                      else document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 bg-white text-primary font-label-md uppercase tracking-widest hover:bg-pale-gold transition-all duration-300 rounded text-sm"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={() => setCurrentSlide((p) => (p - 1 + bannerSlides.length) % bannerSlides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/55 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all z-10 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <button
          onClick={() => setCurrentSlide((p) => (p + 1) % bannerSlides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/55 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all z-10 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </section>

      {/* Product Grid Section */}
      <section className="py-12 md:py-16 px-4 md:px-16 bg-surface flex-1 w-full">
        <div className="max-w-[1280px] mx-auto">
          {/* Section Header */}
          <div className="mb-10 flex justify-between items-end border-b border-stone-gray pb-5">
            <div>
              <p className="font-label-sm text-xs uppercase tracking-[0.2em] text-secondary mb-1">Handpicked Selection</p>
              <h1 className="font-headline-md text-2xl md:text-3xl text-primary font-bold">Featured Products</h1>
            </div>
            <a href="#" className="text-sm font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-8">
            {displayProducts.map((product) => {
              const isAdded = addedIds.has(product.id);
              const qty = quantities[product.id] || 1;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white border border-stone-gray/60 hover:shadow-xl transition-all duration-300 relative rounded-lg overflow-hidden"
                >
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-white text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest px-2 py-1 border border-stone-gray z-10 rounded shadow-sm">
                    {product.category}
                  </span>

                  {/* Image Container with transparent background */}
                  <div className="relative h-72 flex items-center justify-center bg-white border-b border-stone-gray/20">
                    {product.type === 'image' ? (
                      <img
                        src={product.bgUrl}
                        alt={product.name}
                        className="h-[90%] object-contain py-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[64px] text-stone-gray/60">{product.icon}</span>
                    )}
                    
                    {/* Elegant Volume Badge */}
                    <div className="absolute bottom-3 right-3 bg-primary text-white font-bold text-center px-2 py-1 rounded shadow-md z-10 flex flex-col items-center justify-center min-w-[48px]">
                      <span className="text-sm font-headline-md leading-none">{product.volume?.split(' ')?.[0] ?? '750'}</span>
                      <span className="text-[9px] uppercase tracking-wider text-secondary leading-none mt-1">{product.volume?.split(' ')?.[1] ?? 'ML'}</span>
                    </div>

                    {/* Premium Hover Overlay for View */}
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-primary hover:bg-black text-white px-8 py-3 font-label-md text-sm uppercase tracking-widest shadow-lg transition-all w-[80%] mx-auto text-center border border-primary/20"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow flex flex-col items-center text-center p-5">
                    <h3 className="font-headline-md text-base text-primary mb-2 leading-tight font-bold">{product.name}</h3>
                    <p className="font-headline-md text-lg text-secondary font-bold mb-5">{product.price}</p>

                    <div className="w-full flex flex-col gap-3 mt-auto">
                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between border border-stone-gray rounded w-full">
                        <button onClick={() => handleQtyChange(product.id, -1)} className="w-10 h-10 text-on-surface-variant hover:bg-surface-container-low transition-colors font-bold flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <div className="flex-1 h-10 flex items-center justify-center font-bold text-primary bg-surface-container-low/20 border-x border-stone-gray/50">{qty}</div>
                        <button onClick={() => handleQtyChange(product.id, 1)} className="w-10 h-10 text-on-surface-variant hover:bg-surface-container-low transition-colors font-bold flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-3 font-label-md text-xs uppercase tracking-widest transition-all shadow-sm rounded border flex items-center justify-center gap-2 ${
                          isAdded
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-primary hover:bg-primary/90 text-white border-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{isAdded ? 'check' : 'shopping_bag'}</span>
                        {isAdded ? 'Added' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

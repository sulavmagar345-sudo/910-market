import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const productDetails = [
  {
    id: 1,
    category: 'Vodka',
    name: '8848 Premium Vodka',
    price: 'रू 2,200',
    numericPrice: 2200,
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmRYCJuGyE40jVct427zTtANBQZKMt4NCbz11WEhx6HEE9543gB5-9oZdsEdA70oWxZ6Sjd1eGMwnywnFvEQ3EY20S49N-IESF52eOTHBPoeELYkqFZ6Xovz1FtvAI0PJ1Laymbbzi_LAF12hwG0Fwnq9omUvOtvmymLxfSleO0pQUdyXsSlMrYIfbg2s5vZX8mPDnmKmXA_ySovZi4vvM6Mf7cBpsb0jASeWT-J3ijs_9ZHXDq97',
    type: 'image',
    origin: 'Nepal, Himalayas',
    brand: '8848 Vodka',
    abv: '40%',
    volume: '750ML',
    tagline: 'Nepal\'s Purest Wheat Vodka',
    story: `Named after the world's highest peak, 8848 Premium Vodka embodies the purity and grandeur of Nepal's Himalayas. Crafted from select wheat grains grown in the fertile valleys beneath the towering peaks, every bottle carries the essence of altitude and clarity.`,
    color: 'Crystal clear with a pristine aura.',
    nose: 'Pristine aroma of fresh grain and mountain air.',
    palate: 'Exceptionally clean, smooth finish with a subtle hint of wheat.',
    finish: 'Crisp and refreshing.',
  },
  {
    id: 2,
    category: 'Rum',
    name: 'Khukuri XXX Rum',
    price: 'रू 1,850',
    numericPrice: 1850,
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFCorgSAiCCKxziqu3ZtiQm_9_52RmQW1OkrhR-Xq24xbbPJflQNVjsdCK2IzX0FtTciq1nVT-7sfldSMWwoYD2IVVFeNkOk3OF6EGjUCcVO1Az2W21HzUjiix4yZcmG-AATVhDF2JMIthPGi8S0PENc18cLG_6ynBL5BUHa27aC-b0uCk_S_kT1Xzl09l6NJS2t4VtACjsbgDZ5SEmJ14vMD0ILS-EjJL83JkDsLDxpD8yZqcTWbE',
    type: 'image',
    origin: 'Terai, Nepal',
    brand: 'Khukuri',
    abv: '42.8%',
    volume: '750ML',
    tagline: 'The Spirit of the Gurkha',
    story: `Khukuri XXX Rum draws its name from the legendary curved blade of the Gurkha warriors. Since 1959, this rum has been a symbol of Nepali pride – a spirit as bold, resilient, and uncompromising as the warriors who carried the Khukuri into battle across the world.`,
    color: 'Deep amber with warm highlights.',
    nose: 'Warm notes of caramel, vanilla, and dried fruits.',
    palate: 'A robust body with deep molasses complexity.',
    finish: 'Long, satisfying finish that warms from within.',
  },
  {
    id: 3,
    category: 'Vodka',
    name: 'Ruslan Vodka',
    price: 'रू 1,400',
    numericPrice: 1400,
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJm86E1tLSppraf2oUixf2Pa5gb5jZ1jtXZYv47EjqyEIboB89kk2l60gnFPkal_RoqU85OIOLxCNzBeTwyQtycajAPLiMkdwo0JQYLu28L_UVwFUOYqhpIbNIwpJlzEw3bHqkVtCXEwTDVxoPLf2G52SzZA-csLFh2sfM630O7g1l9v4pQGpq1pJ8z-5dGA0qQVk_6J0obDg1go3Bm35hU8bbACMr0kajflgis0a8w-Mt6Qmbl4RD',
    type: 'image',
    origin: 'Kathmandu Valley, Nepal',
    brand: 'Ruslan',
    abv: '37.5%',
    volume: '750ML',
    tagline: 'Smooth. Pure. Unforgettable.',
    story: `Ruslan Vodka is the beloved everyday spirit of Nepal, cherished for its exceptional smoothness and value. Born from a tradition of quality distillation in the Kathmandu Valley, Ruslan has become synonymous with celebration and camaraderie across the nation.`,
    color: 'Pure and transparent.',
    nose: 'Clean and soft with gentle floral notes.',
    palate: 'Silky smooth with a balanced mouthfeel.',
    finish: 'Warm, pleasant, and highly mixable.',
  },
  {
    id: 4,
    category: 'Wine',
    name: 'Highland Reserve White',
    price: 'रू 2,800',
    numericPrice: 2800,
    bgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJgu9c_Q4QGwZI5BGq_QtNhM594vJDCNLNTjyrcSPNNykKBmSBsaPZEyDIBu5cC_jbySnpKw3jDWzuS7WjLKhJcG_O01-FRML6oWnHR0y-QgoKggWmjBdVMzGlftUk9_Hb1B-yKkbN6yNjhmsWmVoWV7iyayHqn7JsW772-qmAeT9FSN6i7VQdkIBz1bJtRt0ZwHE9ZprhYXkKMmiI2bQeBmGcSFqQLRkQrGsHvNdq0iekqkoGCt_O',
    type: 'image',
    origin: 'Mustang, Nepal',
    brand: 'Highland Reserve',
    abv: '12%',
    volume: '750ML',
    tagline: 'Crafted at Altitude',
    story: `Highland Reserve White Wine is Nepal's finest expression of viticulture at extreme altitude. Grown in the ancient terraced vineyards of Mustang at over 2,700 meters, the grapes experience dramatic diurnal temperature shifts that concentrate flavour.`,
    color: 'Pale gold in the glass.',
    nose: 'Aromas of green apple, white peach, and mineral freshness.',
    palate: 'Bright acidity with complex orchard fruit layers.',
    finish: 'Long, elegant, and crisp.',
  },
  {
    id: 5,
    category: 'Whisky',
    name: 'Old Durbar Black',
    price: 'रू 3,450',
    numericPrice: 3450,
    type: 'icon',
    icon: 'liquor',
    origin: 'Kathmandu, Nepal',
    brand: 'Old Durbar',
    abv: '43%',
    volume: '750ML',
    tagline: 'The Taste of Royal Heritage',
    story: `Old Durbar Black takes its name from the historic Durbar Squares of Nepal's royal cities. This premium blended whisky honours the centuries-old tradition of Nepali craftsmanship, offering a smooth and complex spirit worthy of any royal court.`,
    color: 'Rich mahogany with warm amber highlights.',
    nose: 'Dried fruit, oak, and gentle spice.',
    palate: 'Smooth and full-bodied malt sweetness.',
    finish: 'Warming, lingering, and lightly peated.',
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const [liveProduct, setLiveProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!isNaN(Number(id))) {
        // It's a number, so it's a dummy product
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(url), categories(name), brands(name)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setLiveProduct({
          id: data.id,
          category: data.categories?.name || 'Uncategorized',
          name: data.name,
          price: `रू ${Number(data.price).toLocaleString()}`,
          numericPrice: Number(data.price),
          bgUrl: data.product_images?.[0]?.url || '',
          type: data.product_images?.[0]?.url ? 'image' : 'icon',
          origin: 'Local',
          brand: data.brands?.name || 'Unknown',
          abv: 'N/A',
          volume: '750ML',
          tagline: data.short_description || '',
          story: data.description || '',
          color: 'N/A',
          nose: 'N/A',
          palate: 'N/A',
          finish: 'N/A',
        });
      }
      setIsLoading(false);
    }

    fetchProduct();
  }, [id]);

  const mockProduct = productDetails.find((p) => p.id === Number(id));
  const product = liveProduct || mockProduct;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <h2 className="font-headline-lg text-3xl text-primary mb-4">Product not found</h2>
        <Link to="/" className="text-secondary hover:underline font-label-md">← Back to Shop</Link>
      </div>
    );
  }

  const handleAdd = () => {
    for(let i=0; i<qty; i++){
      addItem(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleQtyChange = (delta: number) => {
    setQty(Math.max(1, qty + delta));
  };

  return (
    <div className="flex-1 bg-surface-bright">
      {/* Breadcrumb Navigation */}
      <div className="bg-surface-container-low border-b border-stone-gray py-3 px-4 md:px-16 overflow-x-auto no-scrollbar">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-xs font-label-sm text-on-surface-variant min-w-max">
          <Link to="/" className="hover:text-primary transition-colors flex items-center"><span className="material-symbols-outlined text-[16px] mr-1">home</span> Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface-variant uppercase tracking-wider">{product.category}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Product Image (4 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 border border-stone-gray/60 rounded-xl bg-white p-6 md:p-8 relative flex flex-col items-center justify-center shadow-sm"
          >
            {product.type === 'image' ? (
              <img
                src={product.bgUrl}
                alt={product.name}
                className="h-[280px] sm:h-[350px] md:h-[450px] w-auto object-contain z-10"
              />
            ) : (
              <span className="material-symbols-outlined text-[80px] md:text-[120px] text-stone-gray/60 z-10">{product.icon}</span>
            )}
            
            {/* Volume Badge like reference */}
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-primary text-white font-bold text-center px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-md z-10 flex flex-col items-center justify-center">
              <span className="text-lg md:text-xl font-headline-md leading-none">{product.volume.replace('ML', '')}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-secondary leading-none mt-1">ML</span>
            </div>
          </motion.div>

          {/* Right Column: Product Details & Actions (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 flex flex-col"
          >
            {/* Header / Title */}
            <h1 className="font-headline-lg text-3xl md:text-4xl text-primary font-bold mb-4 leading-tight">
              {product.name}
            </h1>
            
            {/* Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 mb-8 font-body-md text-sm border-b border-stone-gray/50 pb-8">
              <div className="flex gap-2">
                <span className="text-on-surface-variant font-bold">Volume:</span>
                <span className="text-primary">{product.volume}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-on-surface-variant font-bold">Brand:</span>
                <span className="text-secondary">{product.brand}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-on-surface-variant font-bold">Category:</span>
                <span className="text-secondary">{product.category}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-on-surface-variant font-bold">Country:</span>
                <span className="text-primary">{product.origin}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-on-surface-variant font-bold">Alcohol:</span>
                <span className="text-primary">{product.abv}</span>
              </div>
            </div>

            {/* Story & Description */}
            <div className="mb-8 font-body-md text-sm text-[#475569] space-y-4">
              <p>
                <strong>{product.name}</strong> is a popular {product.abv} ABV {product.category.toLowerCase()} classified as a <strong>premium {product.category.toLowerCase()}</strong>.
              </p>
              <p>{product.story}</p>
              
              {/* Tasting Notes */}
              <div className="mt-6 space-y-2 pt-4">
                <p><strong>COLOUR:</strong> {product.color}</p>
                <p><strong>NOSE:</strong> {product.nose}</p>
                <p><strong>PALATE:</strong> {product.palate}</p>
                <p><strong>FINISH:</strong> {product.finish}</p>
              </div>
            </div>
            
            {/* Action Bar (Price, Qty, Place Order) */}
            <div className="mt-auto border border-stone-gray/50 rounded-xl p-5 md:p-6 bg-surface flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-sm">
              
              {/* Price */}
              <div className="text-left w-full xl:w-auto flex justify-between items-center xl:block border-b border-stone-gray/50 xl:border-0 pb-4 xl:pb-0">
                <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant block mb-1">Total Price</span>
                <span className="font-headline-lg text-2xl md:text-3xl text-secondary font-bold">{(product.numericPrice * qty).toLocaleString('en-US', { style: 'currency', currency: 'NPR' }).replace('NPR', 'Rs.')}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-stone-gray rounded-lg h-12 bg-white flex-1 sm:flex-none justify-center">
                    <button onClick={() => handleQtyChange(-1)} className="w-12 h-full text-on-surface-variant hover:bg-surface-container-low transition-colors font-bold flex items-center justify-center border-r border-stone-gray rounded-l-lg">
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <div className="w-16 h-full flex items-center justify-center font-bold text-primary bg-surface-bright">{qty}</div>
                    <button onClick={() => handleQtyChange(1)} className="w-12 h-full text-on-surface-variant hover:bg-surface-container-low transition-colors font-bold flex items-center justify-center border-l border-stone-gray rounded-r-lg">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>

                  {/* Favorite Button */}
                  <button className="h-12 w-12 flex-shrink-0 flex items-center justify-center border border-stone-gray rounded-lg hover:bg-surface-container-low text-secondary transition-colors bg-white shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                  </button>
                </div>

                {/* Place Order / Add to Cart */}
                <button
                  onClick={handleAdd}
                  className={`h-12 px-8 font-label-md uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 font-bold shadow-md w-full sm:w-auto flex-shrink-0 active:scale-[0.98] ${
                    added
                      ? 'bg-secondary text-white'
                      : 'bg-[#EFA75D] hover:bg-[#E09040] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{added ? 'check' : 'shopping_bag'}</span>
                  {added ? 'Added!' : 'Place Order'}
                </button>
              </div>
              
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

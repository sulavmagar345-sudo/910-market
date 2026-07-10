import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(url, is_primary),
          product_variants(id, price, name),
          categories(name),
          brands(name)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        // Get primary image or first image
        const primaryImage = data.product_images?.find((img: any) => img.is_primary)?.url;
        const firstImage = data.product_images?.[0]?.url;
        const imageUrl = primaryImage || firstImage || '';
        
        // Get variant price or base price
        const variantPrice = data.product_variants?.[0]?.price || data.price;
        
        setProduct({
          id: data.id,
          category: data.categories?.name || 'Spirits',
          name: data.name,
          price: `रू ${Number(variantPrice).toLocaleString()}`,
          numericPrice: Number(variantPrice),
          bgUrl: imageUrl,
          type: imageUrl ? 'image' : 'icon',
          icon: 'liquor',
          origin: 'Nepal',
          brand: data.brands?.name || 'Local',
          abv: '40%', // You can add this field to your products table if needed
          volume: '750ML',
          tagline: data.short_description || 'Premium Quality Spirit',
          story: data.description || 'A fine selection from our collection.',
          color: 'Rich and distinctive.',
          nose: 'Complex and inviting aroma.',
          palate: 'Smooth and well-balanced taste.',
          finish: 'Long and satisfying finish.',
        });
      } else {
        console.error('Error fetching product:', error);
      }
      
      setIsLoading(false);
    }

    fetchProduct();
  }, [id]);

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

import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const milestones = [
  { year: '2015', title: 'The First Pour', desc: 'Started as a small curated spirits shop in Kathmandu, handpicking only the finest imported and domestic liquors for our first customers.' },
  { year: '2018', title: 'Going Digital', desc: 'Launched our online platform, bringing premium spirits delivery across the Kathmandu Valley. Orders poured in within hours of launch.' },
  { year: '2021', title: 'Expanding the Vault', desc: 'Grew our catalogue to over 500+ SKUs — from rare single malts to craft gins — making us Nepal\'s most diverse online spirits store.' },
  { year: '2024', title: 'Today & Beyond', desc: 'Now serving thousands of happy customers with same-day delivery inside Ring Road, and a growing collection of rare and exclusive labels.' },
];

const categories = [
  { name: 'Whisky', desc: 'Scotch, Bourbon, Japanese & Nepali' },
  { name: 'Vodka', desc: 'Pure, Flavoured & Premium Imports' },
  { name: 'Wine', desc: 'Red, White, Rosé & Sparkling' },
  { name: 'Rum', desc: 'Dark, White, Spiced & Aged' },
  { name: 'Beer', desc: 'Lager, Craft, IPA & Stout' },
  { name: 'Gin', desc: 'Botanical, Dry & Craft Gin' },
  { name: 'Tequila', desc: 'Blanco, Reposado, Añejo & Mezcal' },
  { name: 'Liqueurs', desc: 'Cream, Coffee, Fruit & Herbal' },
  { name: 'Sake & Asian Spirits', desc: 'Japanese Sake, Soju, Baijiu & Rice Wine' },
  { name: 'Cider & RTD', desc: 'Apple Cider, Hard Seltzer & Ready-to-Drink Cocktails' },
  { name: 'Brandy & Cognac', desc: 'VS, VSOP, XO & Premium Cognac' },
  { name: 'Mixers & Accessories', desc: 'Tonic Water, Syrups, Bitters & Cocktail Mixes' },
];

export default function OurStory() {
  const navigate = useNavigate();

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ───────────────────────────────────────── */}
      <div className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 text-center px-6"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.3em' }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="font-label-md uppercase text-secondary text-sm tracking-[0.3em] block mb-4"
          >
            Est. 2015 · Kathmandu, Nepal
          </motion.span>
          <h1 className="font-headline-md text-5xl md:text-8xl text-white font-bold tracking-tighter mb-6 leading-none">
            Our Story
          </h1>
          <p className="font-body-md text-lg md:text-2xl text-white/70 max-w-2xl mx-auto">
            A decade of passion, precision & premium spirits — crafted for Nepal.
          </p>
        </motion.div>
      </div>

      {/* ── ORIGIN STORY ───────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col md:flex-row gap-16 items-center"
        >
          <motion.div variants={fadeInUp} className="md:w-1/2">
            <span className="font-label-md uppercase tracking-widest text-secondary text-xs mb-3 block">Where It All Began</span>
            <h2 className="font-headline-md text-4xl md:text-5xl text-primary font-bold mb-6 leading-tight">
              Born from a Love of<br />Fine Spirits
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed mb-4">
              9/10 Market started with a single vision — to make world-class spirits accessible to every enthusiast in Nepal. Founded in the heart of Kathmandu, our first store was a tiny space stacked floor-to-ceiling with carefully selected bottles from around the globe.
            </p>
            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed">
              What began as a passion project quickly grew into Nepal's most trusted premium spirits destination, serving connoisseurs, collectors, and curious sippers alike.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop"
              alt="Origin of 9/10 Market"
              className="rounded-2xl shadow-2xl w-full h-[420px] object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── STATS BAND ─────────────────────────────────── */}
      <div className="bg-primary py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: '500+', label: 'Labels in Stock' },
            { value: '10K+', label: 'Happy Customers' },
            { value: '45 min', label: 'Avg. Delivery Time' },
            { value: '9 Years', label: 'Of Excellence' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <p className="font-headline-md text-4xl md:text-5xl text-secondary font-bold">{stat.value}</p>
              <p className="font-label-md uppercase tracking-widest text-white/70 text-xs mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── COMMITMENT ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col md:flex-row-reverse gap-16 items-center"
        >
          <motion.div variants={fadeInUp} className="md:w-1/2">
            <span className="font-label-md uppercase tracking-widest text-secondary text-xs mb-3 block">Our Commitment</span>
            <h2 className="font-headline-md text-4xl md:text-5xl text-primary font-bold mb-6 leading-tight">
              Authenticity in<br />Every Bottle
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed mb-4">
              Every single product in our collection is sourced directly from verified distributors and authorized importers. We don't compromise on authenticity — because you deserve the real thing, every time.
            </p>
            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed">
              Our team personally vets new additions to our catalogue, tasting, researching, and reviewing before a single bottle reaches our shelves or your doorstep.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?q=80&w=1974&auto=format&fit=crop"
              alt="Our commitment to quality"
              className="rounded-2xl shadow-2xl w-full h-[420px] object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── MILESTONES TIMELINE ─────────────────────────── */}
      <div className="bg-surface-bright py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="font-label-md uppercase tracking-widest text-secondary text-xs block mb-3">Our Journey</span>
            <h2 className="font-headline-md text-4xl md:text-5xl text-primary font-bold">Milestones</h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-gray hidden md:block" />

            <div className="space-y-12">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <p className="font-headline-md text-5xl font-bold text-secondary/30 mb-1">{m.year}</p>
                    <h3 className="font-headline-md text-2xl text-primary font-bold mb-3">{m.title}</h3>
                    <p className="font-body-md text-on-surface-variant leading-relaxed">{m.desc}</p>
                  </div>
                  {/* Dot */}
                  <div className="relative z-10 w-5 h-5 rounded-full bg-secondary border-4 border-white shadow-lg shrink-0 hidden md:block" />
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── WHAT WE STOCK ───────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-label-md uppercase tracking-widest text-secondary text-xs block mb-3">The Collection</span>
          <h2 className="font-headline-md text-4xl md:text-5xl text-primary font-bold">Our Full Spirits Range</h2>
          <p className="font-body-md text-on-surface-variant mt-4 max-w-xl mx-auto">
            Sourced from the world's finest distilleries — every category, every occasion, delivered to your door.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="divide-y divide-stone-gray border-t border-b border-stone-gray"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              variants={fadeInUp}
              className="flex items-center justify-between py-5 group cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <span className="font-headline-md text-sm text-secondary/40 font-bold tabular-nums w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="font-label-md uppercase tracking-widest text-primary font-bold text-base group-hover:text-secondary transition-colors duration-200">
                    {cat.name}
                  </h4>
                  <p className="font-body-md text-on-surface-variant text-sm mt-0.5">{cat.desc}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-stone-gray group-hover:text-secondary group-hover:translate-x-1 transition-all duration-200">
                arrow_forward
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── RETURN CTA ──────────────────────────────────── */}
      <div className="bg-primary py-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-headline-md text-4xl md:text-5xl text-white font-bold mb-4">
            Ready to Explore?
          </h2>
          <p className="font-body-md text-white/70 text-lg mb-10 max-w-lg mx-auto">
            Browse our full collection of premium spirits, delivered straight to your door in Kathmandu.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-secondary text-primary font-label-md uppercase tracking-widest rounded-full hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 shadow-xl text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Return to Store
          </button>
        </motion.div>
      </div>

    </div>
  );
}

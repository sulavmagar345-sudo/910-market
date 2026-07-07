import { motion } from 'framer-motion';
import { Button } from './Button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center max-w-md"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 shadow-inner mb-6">
          <Icon className="h-10 w-10 text-admin-deep-forest/60" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">{title}</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {description}
        </p>
        <Link to="/admin">
          <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 border-slate-200">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

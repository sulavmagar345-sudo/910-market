import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/products/ProductForm';
import { useProductsStore } from '../../stores/products.store';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { products } = useProductsStore();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (isEditing) {
      const found = products.find(p => p.id === id);
      if (found) setProduct(found);
    }
  }, [id, isEditing, products]);

  const handleSubmit = async (data: any) => {
    console.log('Saving product:', data);
    // In a real app, call API to save
    navigate('/admin/products');
  };

  if (isEditing && !product) {
    return <div className="p-8 text-center text-admin-text-muted">Loading product details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-admin-text-muted">
            {isEditing ? `Editing ${product.name}` : 'Create a new product in your catalog'}
          </p>
        </div>
      </div>

      <ProductForm 
        initialData={product} 
        onSubmit={handleSubmit} 
        isLoading={false} 
      />
    </div>
  );
}

import { getMasterProductById } from '@/actions/master-data/product';
import MasterProductForm from '@/components/master-data/product/product-form';
import { notFound } from 'next/navigation';
import React from 'react';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const { id } = await params;
  const product = await getMasterProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2">
      <div className="col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MasterProductForm 
          mode="edit" 
          initialData={{
            id: product.id,
            name: product.name,
            category_id: product.category_id,
            price: product.price,
          }}
        />
      </div>
    </div>
  );
};

export default EditProductPage;
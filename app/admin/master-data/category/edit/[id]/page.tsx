import { getMasterCategoryById } from '@/actions/master-data/category';
import MasterCategoryForm from '@/components/master-data/category/category-form';
import { notFound } from 'next/navigation';
import React from 'react';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const { id } = await params;
  const category = await getMasterCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2">
      <div className="col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MasterCategoryForm 
          mode="edit" 
          initialData={{
            id: category.id,
            name: category.name,
          }}
        />
      </div>
    </div>
  );
};

export default EditCategoryPage;
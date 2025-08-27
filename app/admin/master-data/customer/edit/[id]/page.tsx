import { getMasterCustomerById } from '@/actions/master-data/customer';
import MasterCustomerForm from '@/components/master-data/customer/customer-form';
import { notFound } from 'next/navigation';
import React from 'react';

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

const EditCustomerPage = async ({ params }: EditCustomerPageProps) => {
  const customer = await getMasterCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2">
      <div className="col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MasterCustomerForm 
          mode="edit" 
          initialData={{
            id: customer.id,
            name: customer.name,
            farm_name: customer.farm_name,
            contact: customer.contact,
            address: customer.address,
            region_id: customer.region_id,
            altitude: customer.altitude,
            variety: customer.variety,
          }}
        />
      </div>
    </div>
  );
};

export default EditCustomerPage;
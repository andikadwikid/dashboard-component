import MasterProductForm from '@/components/master-data/product/product-form'
import React from 'react'

const CreateMasterProduct = () => {
    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2">
            <div className="col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                <MasterProductForm />
            </div>
        </div>
    )
}

export default CreateMasterProduct
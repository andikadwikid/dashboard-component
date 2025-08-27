import MasterRegionForm from '@/components/master-data/region/region-form'
import React from 'react'

const CreateMasterCustomer = () => {
    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2">
            <div className="col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                <MasterRegionForm />
            </div>
        </div>
    )
}

export default CreateMasterCustomer
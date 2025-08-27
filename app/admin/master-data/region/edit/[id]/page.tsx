import MasterRegionForm from '@/components/master-data/region/region-form'
import { getMasterRegionById } from '@/actions/master-data/region'
import { notFound } from 'next/navigation'
import React from 'react'

interface EditMasterRegionProps {
    params: {
        id: string;
    };
}

const EditMasterRegion = async ({ params }: EditMasterRegionProps) => {
    const region = await getMasterRegionById(params.id);
    
    if (!region) {
        notFound();
    }

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2">
            <div className="col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                <MasterRegionForm 
                    mode="edit" 
                    initialData={{
                        id: region.id,
                        name: region.name,
                        code: region.code
                    }} 
                />
            </div>
        </div>
    )
}

export default EditMasterRegion
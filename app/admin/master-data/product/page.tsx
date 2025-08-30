import { getMasterProduct } from "@/actions/master-data/product";
import { Product, columns } from "./columns";
import { DataTable } from "./data-table";

export default async function ProductMaster() {
    const data: Product[] = await getMasterProduct();
    return (
        <div>
            <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-medium">All Product</h1>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
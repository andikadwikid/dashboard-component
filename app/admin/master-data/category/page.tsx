import { getMasterCategory } from "@/actions/master-data/category";
import { Category, columns } from "./columns";
import { DataTable } from "./data-table";

export default async function CategoryMaster() {
    const data: Category[] = await getMasterCategory();
    return (
        <div>
            <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-medium">All Category</h1>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
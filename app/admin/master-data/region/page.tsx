import { DataTable } from "./data-table";
import { Region, columns } from "./columns";
import { getMasterRegion } from "@/actions/master-data/region";

export default async function CustomerMaster() {
    const data: Region[] = await getMasterRegion();
    return (
        <div>
            <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-medium">All Region</h1>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
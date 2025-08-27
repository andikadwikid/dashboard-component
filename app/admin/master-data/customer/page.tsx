import { getMasterCustomer } from "@/actions/master-data/customer";
import { Customer, columns } from "./columns";
import { DataTable } from "./data-table";

export default async function CustomerMaster() {
    const data: Customer[] = await getMasterCustomer();
    return (
        <div>
            <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-medium">All Customer</h1>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
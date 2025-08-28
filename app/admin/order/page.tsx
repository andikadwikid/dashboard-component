import { DataTable } from "./data-table";
import { Order, columns } from "./columns";
import { getOrders } from "@/actions/order";

export default async function CustomerMaster() {
    const data: Order[] = await getOrders();
    return (
        <div>
            <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-medium">All Order</h1>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
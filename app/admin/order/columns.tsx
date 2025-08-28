"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ArrowUpDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/utils"

export type Order = {
    id: string;
    status: string;
    customer_history: {
        name: string;
        contact: string;
        region_name: string;
        farm_name: string;
    }
}

export const columns: ColumnDef<Order>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "customer_history.name",
        header: "Customer Name",
    },

    {
        accessorKey: "customer_history.farm_name",
        header: "Farm Name",
    },

    {
        accessorKey: "customer_history.region_name",
        header: "Region",
    },

    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status")

            return (
                <Badge className={getStatusColor(status as string)}>
                    {status as string}
                </Badge>
            )
        }
    },
    {
        accessorKey: "customer_history.contact",
        header: "Contact",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <div className="flex justify-end items-center gap-2">
                    <Link href={`/admin/order/detail/${order.id}`}>
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                        </Button>
                    </Link>

                </div>
            )
        },
    },
]
"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ArrowUpDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { deleteMasterCustomer } from "@/actions/master-data/customer"
import { redirect } from "next/navigation"
import Link from "next/link"

export type Customer = {
    id: string;
    name: string;
    contact: string;
    address: string;
    region_id: string;
    farm_name: string;
    altitude: string;
    variety: string;
    create_by: string;
    createdAt: Date;
    updatedAt: Date;
    region: {
        name: string;
    };
};

export const columns: ColumnDef<Customer>[] = [
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
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "contact",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Contact
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "region.name",
        header: "Region",
    },

    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original

            return (
                <div className="flex justify-end items-center gap-2">
                    <Link href={`/admin/master-data/customer/detail/${customer.id}`}>
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                        </Button>
                    </Link>
                    
                    <Button
                        onClick={() => redirect(`/admin/master-data/customer/edit/${customer.id}`)}
                        className="cursor-pointer"
                        size="sm"
                    >
                        Edit
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this customer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMasterCustomer(customer.id)}
                                >
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </div>
            )
        },
    },
]
"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ArrowUpDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { deleteMasterCategory } from "@/actions/master-data/category"
import { redirect } from "next/navigation"
import Link from "next/link"

export type Category = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

export const columns: ColumnDef<Category>[] = [
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
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"))
            return date.toLocaleDateString()
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const category = row.original

            return (
                <div className="flex justify-end items-center gap-2">
                    <Link href={`/admin/master-data/category/detail/${category.id}`}>
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                        </Button>
                    </Link>
                    
                    <Button
                        onClick={() => redirect(`/admin/master-data/category/edit/${category.id}`)}
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
                                    This action cannot be undone. This will permanently delete this category.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMasterCategory(category.id)}
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
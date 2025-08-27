"use client";

import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createMasterCustomer, updateMasterCustomer } from '@/actions/master-data/customer'
import { getMasterRegion } from '@/actions/master-data/region'

import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { MasterCustomerSchema } from "@/schema/customer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MasterCustomerFormProps {
    mode?: 'create' | 'edit';
    initialData?: {
        id: string;
        name: string;
        farm_name: string;
        contact: string;
        address: string;
        region_id: string;
        altitude: string;
        variety: string;
    };
}

const MasterCustomerForm = ({ mode = 'create', initialData }: MasterCustomerFormProps) => {
    const router = useRouter();

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [regions, setRegions] = useState<{ label: string; value: string }[]>([]);

    const [isPending, startTransition] = useTransition();

    const [openRegion, setOpenRegion] = useState(false)


    const form = useForm<z.infer<typeof MasterCustomerSchema>>({
        resolver: zodResolver(MasterCustomerSchema),
        defaultValues: {
            name: initialData?.name || "",
            farm_name: initialData?.farm_name || "",
            contact: initialData?.contact || "",
            address: initialData?.address || "",
            region_id: initialData?.region_id || "",
            altitude: initialData?.altitude || "",
            variety: initialData?.variety || "",
        },
    });

    useEffect(() => {
        const loadRegions = async () => {
            try {
                const regionData = await getMasterRegion();
                const formattedRegions = regionData.map(region => ({
                    label: region.name,
                    value: region.id
                }));
                setRegions(formattedRegions);
            } catch (error) {
                console.error('Error loading regions:', error);
            }
        };

        loadRegions();
    }, []);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            form.reset({
                name: initialData.name,
                farm_name: initialData.farm_name,
                contact: initialData.contact,
                address: initialData.address,
                region_id: initialData.region_id,
                altitude: initialData.altitude,
                variety: initialData.variety,
            });
        }
    }, [mode, initialData, form]);

    const onSubmit = async (values: z.infer<typeof MasterCustomerSchema>) => {
        setError("");
        setSuccess("");

        startTransition(async () => {
            let result;

            if (mode === 'edit' && initialData?.id) {
                result = await updateMasterCustomer(initialData.id, values);
            } else {
                result = await createMasterCustomer(values);
            }

            if (result?.error) {
                setError(result.error);
            }
            if (result?.success) {
                toast.success("Region berhasil diupdate")
                // setSuccess(result.success);
                // if (mode === 'create') {
                //     form.reset();
                // }
                router.push("/admin/master-data/customer")
            }
        });
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <h1 className="text-lg font-medium">{mode === 'edit' ? 'Edit Customer' : 'Create Customer'}</h1>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter customer name"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="farm_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farm Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter customer farm name"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter customer contact"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter customer address"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                <FormField
                                    control={form.control}
                                    name="altitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Altitude</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter Altitude"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="variety"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Variety</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter Variety"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <FormField
                                    control={form.control}
                                    name="region_id"
                                    render={({ field }) => {

                                        return (
                                            <FormItem>
                                                <FormLabel>Region</FormLabel>
                                                <FormControl>
                                                    <Popover open={openRegion} onOpenChange={setOpenRegion}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={`w-auto justify-between ${form.formState.errors.region_id ? "border-red-500 ring-red-500" : ""
                                                                    }`}
                                                            >
                                                                {field.value
                                                                    ? regions.find((r) => r.value === field.value)?.label
                                                                    : "Select region..."}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="start" className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search region..." />
                                                                <CommandEmpty>No region found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {regions.map((region) => (
                                                                        <CommandItem
                                                                            key={region.value}
                                                                            value={region.value}
                                                                            onSelect={() => {
                                                                                field.onChange(region.value)   // update react-hook-form
                                                                                setOpenRegion(false)                 // tutup popover
                                                                            }}
                                                                        >
                                                                            {region.label}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />


                            </div>
                            <FormError message={error} />
                            <FormSuccess message={success} />
                            <Button type="submit" className="cursor-pointer" disabled={isPending}>
                                {mode === 'edit' ? 'Update Customer' : 'Create Customer'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default MasterCustomerForm
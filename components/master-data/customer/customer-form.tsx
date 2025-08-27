"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

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

const regions = [
    { label: "Sumatra", value: "sumatra" },
    { label: "Jawa", value: "jawa" },
    { label: "Kalimantan", value: "kalimantan" },
    { label: "Sulawesi", value: "sulawesi" },
]

const MasterCustomerForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const [isPending, startTransition] = useTransition();

    const [openRegion, setOpenRegion] = useState(false)


    const form = useForm<z.infer<typeof MasterCustomerSchema>>({
        resolver: zodResolver(MasterCustomerSchema),
        defaultValues: {
            name: "",
            farm_name: "",
            contact: "",
            address: "",
            region_id: "",
            altitude: "",
            variety: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof MasterCustomerSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            // form.reset();
            console.log(values)
        });

    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <h1 className="text-lg font-medium">Master Customer</h1>
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
                                Create Customer
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default MasterCustomerForm
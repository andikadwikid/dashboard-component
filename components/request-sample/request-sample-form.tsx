"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { RequestSampleSchema } from "@/schema";
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
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

const regions = [
    { label: "Sumatra", value: "sumatra" },
    { label: "Jawa", value: "jawa" },
    { label: "Kalimantan", value: "kalimantan" },
    { label: "Sulawesi", value: "sulawesi" },
]


const RequestSampleForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const [isPending, startTransition] = useTransition();

    const [openRegion, setOpenRegion] = useState(false)


    const form = useForm<z.infer<typeof RequestSampleSchema>>({
        resolver: zodResolver(RequestSampleSchema),
        defaultValues: {
            pic_name: "",
            pic_contact: "",
            shipment_address: "",
            region: "",
            farm_name: "",
            altitude: "",
            variety: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof RequestSampleSchema>) => {
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
                    <h1 className="text-lg font-medium">Request Sample Form</h1>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pic_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farm PIC Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter PIC name"
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
                                    name="pic_contact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farm PIC Contact</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter Contact PIC"
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
                                    name="shipment_address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shipment Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter Shipment Address"
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
                                                    placeholder="Enter Farm Name"
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
                                    name="region"
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
                                                                className={`w-auto justify-between ${form.formState.errors.region ? "border-red-500 ring-red-500" : ""
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
                                Create request sample
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default RequestSampleForm
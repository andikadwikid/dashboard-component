"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Unlock, Check, ChevronsUpDown } from "lucide-react";

import { OrderSchema } from "@/schema/order";
import { createOrder } from "@/actions/order";
import { getMasterCustomer } from "@/actions/master-data/customer";
import { getMasterRegion } from "@/actions/master-data/region";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Customer {
    id: string;
    name: string;
    farm_name: string;
    contact: string;
    address: string;
    region_id: string;
    altitude: string;
    variety: string;
    region?: {
        name: string;
    };
}

interface Region {
    id: string;
    name: string;
}

const OrderForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [isFieldsLocked, setIsFieldsLocked] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [openCustomerSelect, setOpenCustomerSelect] = useState(false);
    const [openRegionSelect, setOpenRegionSelect] = useState(false);

    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(OrderSchema),
        defaultValues: {
            customer_selection: {
                mode: "new",
                customer_id: undefined,
                customer_data: {
                    name: "",
                    contact: "",
                    address: "",
                    region_id: "",
                    farm_name: "",
                    altitude: "",
                    variety: ""
                }
            },
            status: "pending"
        },
    });

    useEffect(() => {
        fetchCustomers();
        fetchRegions();
    }, []);

    const fetchCustomers = async () => {
        try {
            const result = await getMasterCustomer();
            if (result && Array.isArray(result)) {
                setCustomers(result);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchRegions = async () => {
        try {
            const result = await getMasterRegion();
            if (result && Array.isArray(result)) {
                setRegions(result);
            }
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsFieldsLocked(true);

        // Fill form with customer data
        form.setValue("customer_selection.mode", "existing");
        form.setValue("customer_selection.customer_id", customer.id);
        form.setValue("customer_selection.customer_data.name", customer.name);
        form.setValue("customer_selection.customer_data.contact", customer.contact);
        form.setValue("customer_selection.customer_data.address", customer.address);
        form.setValue("customer_selection.customer_data.farm_name", customer.farm_name);
        form.setValue("customer_selection.customer_data.altitude", customer.altitude);
        form.setValue("customer_selection.customer_data.variety", customer.variety);
        form.setValue("customer_selection.customer_data.region_id", customer.region_id);

        setOpenCustomerSelect(false);
    };

    const handleUnlockFields = () => {
        setIsFieldsLocked(false);
        setSelectedCustomer(null);

        // Clear form fields
        form.setValue("customer_selection.mode", "new");
        form.setValue("customer_selection.customer_id", "");
        form.setValue("customer_selection.customer_data.name", "");
        form.setValue("customer_selection.customer_data.contact", "");
        form.setValue("customer_selection.customer_data.address", "");
        form.setValue("customer_selection.customer_data.farm_name", "");
        form.setValue("customer_selection.customer_data.altitude", "");
        form.setValue("customer_selection.customer_data.variety", "");
        form.setValue("customer_selection.customer_data.region_id", "");
    };

    const handleLockFields = () => {
        setIsFieldsLocked(true);
    };

    const onSubmit = async (values: z.infer<typeof OrderSchema>) => {
        setError("");
        setSuccess("");

        startTransition(async () => {
            try {
                const result = await createOrder(values);
                if (result?.error) {
                    setError(result.error);
                }
                if (result?.success) {
                    form.reset();
                    setIsFieldsLocked(false);
                    setSelectedCustomer(null);
                    toast.success("Order berhasil dibuat");
                    router.push("/admin/order");
                }
            } catch {
                setError("Terjadi kesalahan saat membuat order");
            }
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Order</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Customer Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Customer Information</h3>
                                    <div className="flex items-center gap-2">
                                        {selectedCustomer && (
                                            <span className="text-sm text-muted-foreground">
                                                Selected: {selectedCustomer.name}
                                            </span>
                                        )}
                                        {isFieldsLocked ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleUnlockFields}
                                            >
                                                <Unlock className="h-4 w-4 mr-2" />
                                                Unlock Fields
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLockFields}
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Lock Fields
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Selector */}
                                <div className="mb-4">
                                    <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCustomerSelect}
                                                className="w-full justify-between"
                                            >
                                                {selectedCustomer
                                                    ? `${selectedCustomer.name} - ${selectedCustomer.farm_name}`
                                                    : "Select customer from master data..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search customer..." />
                                                <CommandList>
                                                    <CommandEmpty>No customer found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {customers.map((customer) => (
                                                            <CommandItem
                                                                key={customer.id}
                                                                value={`${customer.name} ${customer.farm_name}`}
                                                                onSelect={() => handleCustomerSelect(customer)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {customer.name} - {customer.farm_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Customer Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PIC Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter PIC name"
                                                        {...field}
                                                        disabled={isFieldsLocked}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.contact"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PIC Contact</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter contact"
                                                        {...field}
                                                        disabled={isFieldsLocked}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.farm_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Farm Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter farm name"
                                                        {...field}
                                                        disabled={isFieldsLocked}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shipment Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter shipment address"
                                                        {...field}
                                                        disabled={isFieldsLocked}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.region_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Region</FormLabel>
                                                <Popover open={openRegionSelect} onOpenChange={setOpenRegionSelect}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                disabled={isFieldsLocked}
                                                                className={cn(
                                                                    "w-full justify-between",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? regions.find((region) => region.id === field.value)?.name
                                                                    : "Select region"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search region..." />
                                                            <CommandList>
                                                                <CommandEmpty>No region found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {regions.map((region) => (
                                                                        <CommandItem
                                                                            key={region.id}
                                                                            value={region.name}
                                                                            onSelect={() => {
                                                                                form.setValue("customer_selection.customer_data.region_id", region.id);
                                                                                setOpenRegionSelect(false);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    region.id === field.value ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {region.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.altitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Altitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter altitude"
                                                        {...field}
                                                        disabled={isFieldsLocked}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customer_selection.customer_data.variety"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Variety</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter variety"
                                                        {...field}
                                                        disabled={isFieldsLocked}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormError message={error} />
                            <FormSuccess message={success} />

                            <Button type="submit" disabled={isPending} className="w-full">
                                {isPending ? "Creating Order..." : "Create Order"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderForm;
"use client";

import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createMasterProduct, updateMasterProduct } from '@/actions/master-data/product'
import { getMasterCategory } from '@/actions/master-data/category'

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
import { ChevronsUpDown, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { MasterProductSchema } from "@/schema/product";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MasterProductFormProps {
    mode?: 'create' | 'edit';
    initialData?: {
        id: string;
        name: string;
        category_id: string;
        price: number;
    };
    onSuccess?: () => void;
    showCard?: boolean;
}

const MasterProductForm = ({ mode = 'create', initialData, onSuccess, showCard = true }: MasterProductFormProps) => {
    const router = useRouter();

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);

    const [isPending, startTransition] = useTransition();

    const [openCategory, setOpenCategory] = useState(false)

    const form = useForm<z.infer<typeof MasterProductSchema>>({
        resolver: zodResolver(MasterProductSchema),
        defaultValues: {
            name: initialData?.name || "",
            category_id: initialData?.category_id || "",
            price: initialData?.price || 0,
        },
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryData = await getMasterCategory();
                const formattedCategories = categoryData.map(category => ({
                    label: category.name,
                    value: category.id
                }));
                setCategories(formattedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            form.reset({
                name: initialData.name,
                category_id: initialData.category_id,
                price: initialData.price,
            });
        }
    }, [mode, initialData, form]);

    const onSubmit = async (values: z.infer<typeof MasterProductSchema>) => {
        setError("");
        setSuccess("");

        startTransition(async () => {
            let result;

            if (mode === 'edit' && initialData?.id) {
                result = await updateMasterProduct(initialData.id, values);
            } else {
                result = await createMasterProduct(values);
            }

            if (result?.error) {
                setError(result.error);
            }
            if (result?.success) {
                toast.success(mode === 'edit' ? "Product berhasil diupdate" : "Product berhasil dibuat")
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/admin/master-data/product")
                }
                if (mode === 'create') {
                    form.reset();
                }
            }
        });
    };

    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isPending}
                                        placeholder="Enter product name"
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
                        name="category_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Category</FormLabel>
                                <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                disabled={isPending}
                                            >
                                                {field.value
                                                    ? categories.find(
                                                        (category) => category.value === field.value
                                                    )?.label
                                                    : "Select category"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search category..." />
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {categories.map((category) => (
                                                    <CommandItem
                                                        value={category.label}
                                                        key={category.value}
                                                        onSelect={() => {
                                                            form.setValue("category_id", category.value)
                                                            setOpenCategory(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                category.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {category.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isPending}
                                        placeholder="Enter product price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />

                <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full"
                >
                    {mode === 'edit' ? 'Update Product' : 'Create Product'}
                </Button>
            </form>
        </Form>
    );

    if (!showCard) {
        return formContent;
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <h2 className="text-2xl font-bold text-center">
                    {mode === 'edit' ? 'Edit Product' : 'Create Product'}
                </h2>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    );
}

export default MasterProductForm
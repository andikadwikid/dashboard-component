"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createMasterCategory, updateMasterCategory } from '@/actions/master-data/category'

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

import { MasterCategorySchema } from "@/schema/category";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MasterCategoryFormProps {
    mode?: 'create' | 'edit';
    initialData?: {
        id: string;
        name: string;
    };
    onSuccess?: () => void;
    showCard?: boolean;
}

const MasterCategoryForm = ({ mode = 'create', initialData, onSuccess, showCard = true }: MasterCategoryFormProps) => {
    const router = useRouter();

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof MasterCategorySchema>>({
        resolver: zodResolver(MasterCategorySchema),
        defaultValues: {
            name: initialData?.name || "",
        },
    });

    const onSubmit = (values: z.infer<typeof MasterCategorySchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            if (mode === 'edit' && initialData?.id) {
                updateMasterCategory(initialData.id, values)
                    .then((data) => {
                        if (data?.error) {
                            setError(data.error);
                            toast.error(data.error);
                        }
                        if (data?.success) {
                            setSuccess(data.success);
                            toast.success(data.success);
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                router.push('/admin/master-data/category');
                            }
                        }
                    })
                    .catch(() => setError("Something went wrong!"));
            } else {
                createMasterCategory(values)
                    .then((data) => {
                        if (data?.error) {
                            setError(data.error);
                            toast.error(data.error);
                        }
                        if (data?.success) {
                            setSuccess(data.success);
                            toast.success(data.success);
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                router.push('/admin/master-data/category');
                            }
                        }
                    })
                    .catch(() => setError("Something went wrong!"));
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
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="Enter category name"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormError message={error} />
                <FormSuccess message={success} />
                <Button disabled={isPending} type="submit" className="w-full">
                    {mode === 'edit' ? 'Update Category' : 'Create Category'}
                </Button>
            </form>
        </Form>
    );

    if (showCard) {
        return (
            <Card className="w-[400px]">
                <CardHeader>
                    <h2 className="text-2xl font-bold text-center">
                        {mode === 'edit' ? 'Edit Category' : 'Create Category'}
                    </h2>
                </CardHeader>
                <CardContent>
                    {formContent}
                </CardContent>
            </Card>
        );
    }

    return formContent;
};

export default MasterCategoryForm;
"use client";

import { toast } from "sonner"
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
import { MasterRegionSchema } from "@/schema/region";
import { createMasterRegion } from "@/actions/master-data/region";
import { useRouter } from "next/navigation";

const MasterRegionForm = () => {
    const router = useRouter();

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof MasterRegionSchema>>({
        resolver: zodResolver(MasterRegionSchema),
        defaultValues: {
            code: "",
            name: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof MasterRegionSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            createMasterRegion(values).then((res) => {
                if (res.error) {
                    setError(res.error);
                } else {
                    toast.success("Region berhasil ditambahkan")

                    router.push("/admin/master-data/region")
                }
            })
            console.log(values)
        });

    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <h1 className="text-lg font-medium">Master Region</h1>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter code region"
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
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    placeholder="Enter region name"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <FormError message={error} />
                            <FormSuccess message={success} />
                            <Button type="submit" className="cursor-pointer" disabled={isPending}>
                                Create Region
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default MasterRegionForm
"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { RegisterSchema, RequestSampleSchema } from "@/schema";
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
import { register } from "@/actions/register";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RequestSampleForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const [isPending, startTransition] = useTransition();

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
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Region</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger
                                                        className={`w-auto cursor-pointer ${form.formState.errors.region ? "border-red-500 ring-red-500" : ""
                                                            }`}
                                                    >
                                                        <SelectValue placeholder="Region" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Sumatra</SelectItem>
                                                        <SelectItem value="user">Jawa</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
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
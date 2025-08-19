"use client"

import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters." })
        .max(50),
    email: z
        .email({ message: "Invalid email address." })
        .max(100),
    phone: z
        .string()
        .min(10, { message: "Phone number must be at least 10 characters." })
        .max(15),
    location: z
        .string()
        .min(2, { message: "Location must be at least 2 characters." }),
    role: z
        .enum(["Admin", "User"], { message: "Please select a role." }),
})

export default function EditUser() {
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "johndoe",
            email: "johndoe@example.com",
            phone: "1234567890",
            location: "New York",
            role: "Admin",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <div>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="mb-4">Edit Profile</SheetTitle>
                    <SheetDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"></form>
                        </Form>
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </div>
    )
}
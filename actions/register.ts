"use server";

import {db} from "@/lib/db";
import bcrypt from "bcryptjs";
import {RegisterSchema} from "@/schema";
import * as z from "zod";
import {getUserByEmail} from "@/data/user";

export const register = async (value: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(value);

    if (!validatedFields.success) {
        return {error: "Invalid fields!"};
    }

    const {name, email, password} = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return {error: "Email already in use!"};
    }

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    })

    // TODO: Send verification token email

    return {success: "Registration successful"};
};

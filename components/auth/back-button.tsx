
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BackButtonProps {
    href: string;
    label: string;
}

const BackButton = ({ href, label }: BackButtonProps) => {
    return (
        <div>
            <Button variant={"link"} size={"sm"} className="font-normal w-full text-slate-500" asChild>
                <Link href={href}>
                    {label}
                </Link>
            </Button>
        </div>
    )
}

export default BackButton
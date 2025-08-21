"use client";

import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/ui/button";

const Social = () => {
    return (
        <div className="flex w-full items-center gap-2 px-6">
            <Button size="lg" variant="outline" className="flex-1">
                <FcGoogle className="h-5 w-5" />
            </Button>

            <Button size="lg" variant="outline" className="flex-1">
                <FaGithub className="h-5 w-5" />
            </Button>
        </div>
    )
}

export default Social
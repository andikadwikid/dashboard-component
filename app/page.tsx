import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function Home() {
  return (
    <>
      <main className="flex h-full flex-col items-center justify-center 
        bg-radial-[at_25%_25%] from-blue-400 to-blue-800 to-75%">
        <div className="space-y-6 text-center">
          <h1 className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}>
            🔐 Auth
          </h1>
          <p className="text-white text-lg">
            Simple authentication service
          </p>

          <div>
            <LoginButton>
              <Button variant={"secondary"} size={"lg"} className="w-full">
                Sign In
              </Button>
            </LoginButton>
          </div>
        </div>
      </main >
    </>
  );
}
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";

export default function Home() {
  return (
    <div>
      <div className="h-screen flex items-center justify-center">
        <Button size={"xl"} className="rounded-full">
          <CirclePlus />
          Click me
        </Button>
      </div>
    </div>
  );
}
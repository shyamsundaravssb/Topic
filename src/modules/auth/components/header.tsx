import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { LockKeyhole } from "lucide-react";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center gap-x-2">
        <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
          <LockKeyhole className="h-6 w-6 text-primary" />
        </div>
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight text-foreground",
            font.className
          )}
        >
          Topic App
        </h1>
      </div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
};

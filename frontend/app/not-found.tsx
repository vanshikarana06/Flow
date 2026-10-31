import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#F8F4EC] text-[#29251F] p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg mb-3 shadow-soft">
        F
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[#29251F]">Page Not Found</h1>
      <p className="text-xs text-[#777064] mt-1.5 max-w-sm">
        The requested workspace route could not be located or has moved.
      </p>
      <div className="mt-5">
        <Link href="/dashboard">
          <Button size="sm" className="text-xs font-semibold bg-primary hover:bg-primary-hover text-white">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}


import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h2 className="text-2xl font-bold text-[#29251F]">Page Not Found</h2>
      <p className="text-sm text-[#777064] mt-2 mb-6">
        The requested resource could not be found.
      </p>
      <Link href="/dashboard">
        <Button className="bg-primary hover:bg-primary-hover text-white text-xs">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

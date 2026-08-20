import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="mb-4 h-16 w-16 text-red-400" />
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="mt-2 max-w-md text-gray-400">
        You don't have permission to view this page. If you believe this is a mistake, contact an administrator.
      </p>
      <Link href="/" className="mt-6"><Button>Back to Home</Button></Link>
    </div>
  );
}

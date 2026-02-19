import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <Button asChild className="mt-6">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </main>
  );
}

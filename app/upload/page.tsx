"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Shelby SDK includes Node.js-only modules (@aptos-labs/aptos-client uses `got`).
// Disabling SSR prevents them from loading during server-side rendering.
const UploadForm = dynamic(() => import("@/components/upload-form"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  ),
});

export default function UploadPage() {
  return <UploadForm />;
}

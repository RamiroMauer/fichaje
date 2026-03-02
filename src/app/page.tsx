"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StationFlow } from "@/components/StationFlow";

function ClockInApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stationParam = searchParams.get("station");

  useEffect(() => {
    // Redirect if ?station=X is provided
    if (stationParam) {
      router.replace(`/s/${stationParam}`);
    }
  }, [stationParam, router]);

  // Optionally, we could simply return null when redirecting via search param.
  // When no search param is present, default behaviour could be `/s/1`,
  // but it's simpler to just render StationFlow for "1" so that the root page is still functional.

  if (stationParam) return null; // Wait for redirect

  // Default to station 1 if on root and no param provided
  return <StationFlow stationId="1" />;
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Cargando...</div>}>
        <ClockInApp />
      </Suspense>
    </div>
  );
}

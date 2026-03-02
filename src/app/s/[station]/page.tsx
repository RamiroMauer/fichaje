"use client";

import { use } from "react";
import { StationFlow } from "@/components/StationFlow";

interface PageProps {
    params: Promise<{
        station: string;
    }>;
}

export default function StationPage({ params }: PageProps) {
    // Use React.use to unwrap the params Promise as required by Next.js 15
    const resolvedParams = use(params);
    const stationId = resolvedParams.station;

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
            <StationFlow stationId={stationId} />
        </div>
    );
}

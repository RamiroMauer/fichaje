import { use } from "react";
import { StationFlow } from "@/components/StationFlow";
import { createAdminClient } from "@/lib/supabase/server";

interface PageProps {
    params: Promise<{
        station: string;
    }>;
}

export default async function StationPage({ params }: PageProps) {
    const resolvedParams = await params;
    const stationId = resolvedParams.station;

    // Obtener los cajeros asignados a esta estación desde Supabase.
    // Usamos el Admin Client porque esta es una lectura del servidor
    // y queremos bypassear RLS o requerimientos de sesión para la máquina.
    const supabase = createAdminClient();

    const { data: assignments, error } = await supabase
        .from('station_assignments')
        .select(`
            cashiers (
                id,
                display_name
            )
        `)
        .eq('station_id', stationId);

    if (error) {
        console.error("Error al cargar cajeros asignados a la estación:", error);
    }

    // Mapear los resultados de la DB
    // Type casting temporal por la estructura anidada de la relación
    const employees = assignments?.map((a: any) => ({
        id: a.cashiers.id,
        name: a.cashiers.display_name
    })) || [];

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
            <StationFlow stationId={stationId} employees={employees} />
        </div>
    );
}

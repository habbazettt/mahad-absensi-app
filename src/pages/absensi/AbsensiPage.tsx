import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Mahasantri } from "@/types";
import { useEffect, useState } from "react";
import { authCheck } from "@/lib/utils";
import MahasantriFilter from "@/components/filter/MahasantriFilter";

export default function AbsensiPage() {
    const [mahasantriData, setMahasantriData] = useState<Mahasantri[]>([])
    const [absensiData, setAbsensiData] = useState([])
    const [selectedMahasantriId, setSelectedMahasantriId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (authCheck()) {
                try {
                    await fetchMahasantriData(1, "")
                } catch (err) {
                    console.error("Initial fetch error:", err)
                }
            }
        }
        fetchInitialData()
    }, [])

    const fetchMahasantriData = async (page: number, search: string) => {
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/mahasantri`)
            url.searchParams.append('page', page.toString())
            url.searchParams.append('limit', '10')
            if (search) {
                url.searchParams.append('nama', search)
            }
            const response = await fetch(url.toString())
            if (!response.ok) throw new Error("Gagal mengambil data mahasantri")
            const data = await response.json()
            if (data.status) {
                setMahasantriData(data.data.mahasantri)
            }
        } catch (err) {
            console.error("Fetch error:", err)
        }
    }

    const fetchAbsensiData = async (mahasantri_id: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi/mahasantri/${mahasantri_id}/daily-summary?month=04&year=2025`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`
                }
            })

            if (!response.ok) throw new Error("Gagal mengambil data absensi")

            const data = await response.json()

            if (data.status) {
                setAbsensiData(data.data)
            }
        } catch (err) {
            console.error("Fetch error:", err)
        }
    }

    const handleMahasantriFilter = async (mahasantriId: string) => {
        if (mahasantriId === "all") {
            setSelectedMahasantriId(undefined);
        } else {
            setSelectedMahasantriId(mahasantriId);
            fetchAbsensiData(parseInt(mahasantriId))
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 font-jakarta">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-muted-foreground">Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Absensi Halaqoh</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
                    <MahasantriFilter
                        mahasantriData={mahasantriData}
                        handleMahasantriFilter={handleMahasantriFilter}
                        selectedMahasantriId={selectedMahasantriId}
                    />

                    {/* Calendar */}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
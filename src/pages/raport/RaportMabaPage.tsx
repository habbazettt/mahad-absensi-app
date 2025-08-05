import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/Footer";
import RaportMaba2025 from "@/components/RaportMaba2025";
import ToasterLayout from "@/components/ToasterLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RaportMabaPage() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") ?? '{}');

    useEffect(() => {
        if (!user) {
            navigate("/auth/login");
            return;
        } else {
            if (user.is_data_murojaah_filled === false) {
                navigate("/dashboard/data-murojaah/add");
                return
            }
        }
    }, [])

    return (
        <>
            <ToasterLayout />
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
                                        <BreadcrumbPage className="text-primary">Raport Kelulusan</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <main className="p-4 md:p-6 flex flex-1 flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Raport Kelulusan Mahasantri Baru</h1>
                                <p className="text-muted-foreground">Pantau raport kelulusan pendaftaran mahasantri baru Mahad Tahfidz Al-Qur'an UIN Bandung</p>
                            </div>
                        </div>
                        <RaportMaba2025 />
                    </main>
                </SidebarInset>
            </SidebarProvider>
            <Footer />
        </>
    )
}
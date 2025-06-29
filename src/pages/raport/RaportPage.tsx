import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/Footer";
import RaportTahun2025 from "@/components/Raport2025";
import ToasterLayout from "@/components/ToasterLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function RaportPage() {
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
                                <h1 className="text-2xl font-bold">Raport Kelulusan Tahunan</h1>
                                <p className="text-muted-foreground">Pantau raport kelulusan tahunan mahasantri Anda.</p>
                            </div>
                        </div>
                        <RaportTahun2025 />
                    </main>
                </SidebarInset>
            </SidebarProvider>
            <Footer />
        </>
    )
}
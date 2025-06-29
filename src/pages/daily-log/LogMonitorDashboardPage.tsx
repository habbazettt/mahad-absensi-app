import AccordionLogHarian from "@/components/AccordionLogHarian";
import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/Footer";
import TabelRekapMingguan from "@/components/TabelRekapMingguan";
import ToasterLayout from "@/components/ToasterLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MentorMonitorPage() {
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
                                        <BreadcrumbPage className="text-primary">Monitor Murojaah</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <main className="p-4 md:p-6 flex flex-1 flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Monitoring Bimbingan</h1>
                                <p className="text-muted-foreground">Pantau progres murojaah mahasantri Anda.</p>
                            </div>
                        </div>

                        {/* Sistem Navigasi Tab */}
                        <Tabs defaultValue="rekap-mingguan" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="rekap-mingguan">Rekapitulasi Mingguan</TabsTrigger>
                                <TabsTrigger value="log-harian">Log Harian Detail</TabsTrigger>
                            </TabsList>
                            <TabsContent value="rekap-mingguan">
                                <TabelRekapMingguan />
                            </TabsContent>
                            <TabsContent value="log-harian">
                                <AccordionLogHarian />
                            </TabsContent>
                        </Tabs>
                    </main>
                </SidebarInset>
            </SidebarProvider>
            <Footer />
        </>
    )
}
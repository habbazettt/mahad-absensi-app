import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { handleLogout, isTokenExpired } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Mahasantri, Mentor } from "@/types";
import ToasterLayout from "@/components/ToasterLayout";

export default function DashboardMahasantri() {
    const [user, setUser] = useState<Mahasantri>({
        id: 0,
        nim: "",
        nama: "",
        jurusan: "",
        gender: "",
        mentor_id: 0,
    });
    const [mentor, setMentor] = useState<Mentor>({
        id: 0,
        nama: "",
        gender: "",
        email: "",
        mahasantri_count: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr || isTokenExpired()) {
                    handleLogout(navigate);
                    return;
                }
                const userData = JSON.parse(userStr);
                if (userData.user_type !== "mahasantri") {
                    navigate("/auth/login");
                    return;
                }
                setUser(userData);
            } catch (error) {
                console.error("Gagal parse data user:", error);
                handleLogout(navigate);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [navigate]);

    useEffect(() => {
        const fetchMentors = async () => {
            if (!user || !user.mentor_id) {
                setError("Mentor ID tidak ditemukan. Silakan hubungi administrator untuk memperbarui data Anda.");
                return;
            }
            try {
                setIsLoading(true);
                setError(""); // Reset error state
                const response = await fetch(`${import.meta.env.VITE_API_URL}/mentors/${user.mentor_id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status) {
                    setMentor(data.data);
                } else {
                    setError("Gagal memuat data mentor: " + data.message);
                }
            } catch (err) {
                setError("Gagal memuat data mentor: " + (err instanceof Error ? err.message : 'Terjadi kesalahan'));
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) {
            fetchMentors();
        }
    }, [user])

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
                                        <BreadcrumbPage className="text-primary">Detail Mahasantri</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {!isLoading && (
                            <div className="flex flex-col gap-4">
                                <Card className="w-full">
                                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <CardTitle className="text-2xl font-bold">
                                            Detail Mahasantri: {user.nama}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-muted-foreground text-sm">
                                            <p><span className="font-semibold">NIM:</span> {user.nim}</p>
                                            <p><span className="font-semibold">Jurusan:</span> {user.jurusan}</p>
                                            {!isLoading && (
                                                <p>
                                                    <span className="font-semibold">Mentor:</span> {mentor?.gender === "L" ? "Ust. " : "Usth. "}{mentor?.nama}
                                                </p>
                                            )}
                                        </div>
                                        {error && (
                                            <div className="mt-2 text-red-500">{error}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
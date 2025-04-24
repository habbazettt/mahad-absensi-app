/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Hafalan, MahasantriWithHafalan } from "@/types";
import { BookOpenText, Clock, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodaySetoranListProps {
    className?: string;
}

export default function TodaySetoranList({ className }: TodaySetoranListProps) {
    const [students, setStudents] = useState<MahasantriWithHafalan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const user = JSON.parse(localStorage.getItem("user") ?? '{}');

    useEffect(() => {
        const userId = user.id;

        const fetchData = async () => {
            try {
                // Fetch today's hafalan
                const hafalanResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/hafalan?page=1&limit=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                    }
                );

                if (!hafalanResponse.ok) throw new Error("Gagal mengambil data hafalan");

                const hafalanData = await hafalanResponse.json();
                const todayHafalan = filterTodayHafalan(hafalanData.data.hafalan);

                // Get unique mahasantri IDs
                const uniqueIds = [...new Set(todayHafalan.map(h => h.mahasantri_id))];

                // Fetch mahasantri details in parallel
                const studentsPromises = uniqueIds.map(id =>
                    fetch(`${import.meta.env.VITE_API_URL}/mahasantri/${id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                    }).then(res => res.json())
                );

                const studentsData = await Promise.all(studentsPromises);

                // Combine hafalan data with mahasantri data
                const combinedData: MahasantriWithHafalan[] = studentsData.map((student, index) => {
                    const hafalanList = todayHafalan.filter(h => h.mahasantri_id === uniqueIds[index]);
                    const summary = {
                        total_perKategori: {
                            ziyadah: hafalanList.filter(h => h.kategori === "ziyadah").reduce((sum, h) => sum + h.total_setoran, 0),
                            murojaah: hafalanList.filter(h => h.kategori === "murojaah").reduce((sum, h) => sum + h.total_setoran, 0),
                        },
                    };
                    return {
                        mahasantri: student.data,
                        list_hafalan: hafalanList,
                        summary,
                    };
                });

                const filteredCombinedData = combinedData.filter(student => student.mahasantri.mentor_id === userId)

                setStudents(filteredCombinedData);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filterTodayHafalan = (hafalanList: Hafalan[]) => {
        const today = new Date();
        const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        const todayEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
        );

        return hafalanList.filter(h => {
            const hafalanDate = new Date(h.created_at);
            return hafalanDate >= todayStart && hafalanDate < todayEnd;
        });
    };

    if (error) {
        return (
            <Card className="p-4 text-destructive">
                ⚠️ {error}
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                ))}
            </Card>
        );
    }

    return (
        <Card className={cn("p-6 shadow-lg", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <BookOpenText className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold">Setoran Hari Ini</h3>
                    <p className="text-sm text-muted-foreground">
                        Daftar mahasantri yang telah menyetor hafalan
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {students.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                        <ScrollText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Belum ada setoran hari ini</p>
                    </div>
                ) : (
                    students.map((mahasantri, index) => (
                        <div key={mahasantri.mahasantri.id}>
                            <div className="group flex items-center gap-4 p-4 hover:bg-muted/50 rounded-xl transition-all duration-300">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-medium">
                                        {mahasantri.mahasantri.nama[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <h4 className="text-lg font-medium">
                                        {mahasantri.mahasantri.nama}
                                    </h4>
                                    <div className="flex flex-col xl:flex-row gap-2 mt-2">
                                        <Badge
                                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-100/80 w-fit"
                                            variant="outline"
                                        >
                                            <Clock className="h-4 w-4 mr-2" />
                                            Ziyadah: {mahasantri.summary.total_perKategori.ziyadah} Halaman
                                        </Badge>
                                        <Badge
                                            className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-100/80 w-fit"
                                            variant="outline"
                                        >
                                            <Clock className="h-4 w-4 mr-2" />
                                            Murojaah: {mahasantri.summary.total_perKategori.murojaah} Halaman
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {index !== students.length - 1 && (
                                <Separator className="my-2 bg-muted" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Absensi, AttendanceSummary, TodayAttendanceWidgetProps } from "@/types";
import { Calendar, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodayAttendanceList({ className }: TodayAttendanceWidgetProps) {
    const [attendanceData, setAttendanceData] = useState<AttendanceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const user = JSON.parse(localStorage.getItem("user") ?? '{}');

    useEffect(() => {
        const userId = user.id;

        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/absensi?mentor_id=${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                    }
                );

                if (!response.ok) throw new Error("Gagal mengambil data absensi");

                const data = await response.json();
                if (data.status) {
                    const absensiList: Absensi[] = data.data.absensi;

                    // Mengelompokkan data absensi berdasarkan mahasantri
                    const summary: { [key: number]: AttendanceSummary } = {};

                    absensiList.forEach(absensi => {
                        const { mahasantri } = absensi;
                        if (!summary[mahasantri.id]) {
                            summary[mahasantri.id] = {
                                mahasantriId: mahasantri.id,
                                nama: mahasantri.nama,
                                totalHadir: 0,
                                totalIzin: 0,
                                totalAbsen: 0,
                            };
                        }

                        // Hitung total berdasarkan status
                        if (absensi.status === 'hadir') {
                            summary[mahasantri.id].totalHadir += 1;
                        } else if (absensi.status === 'izin') {
                            summary[mahasantri.id].totalIzin += 1;
                        } else if (absensi.status === 'absen') {
                            summary[mahasantri.id].totalAbsen += 1;
                        }
                    });

                    // Ubah summary menjadi array
                    setAttendanceData(Object.values(summary));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                    <Calendar className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold">Rekap Absensi Mahasantri</h3>
                    <p className="text-sm text-muted-foreground">
                        Daftar rekap absensi per mahasantri
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {attendanceData.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                        <ScrollText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Belum ada absensi hari ini</p>
                    </div>
                ) : (
                    attendanceData.map((summary) => (
                        <div key={summary.mahasantriId}>
                            <div className="group flex items-center gap-4 p-4 hover:bg-muted/50 rounded-xl transition-all duration-300">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-medium">
                                        {summary.nama[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <h4 className="text-lg font-medium">
                                        {summary.nama}
                                    </h4>
                                    <div className="flex flex-row gap-2 mt-2">
                                        <Badge
                                            className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-100/80 w-fit"
                                            variant="outline"
                                        >
                                            Hadir: {summary.totalHadir}
                                        </Badge>
                                        <Badge
                                            className="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 w-fit"
                                            variant="outline"
                                        >
                                            Izin: {summary.totalIzin}
                                        </Badge>
                                        <Badge
                                            className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-100/80 w-fit"
                                            variant="outline"
                                        >
                                            Absen: {summary.totalAbsen}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {summary.mahasantriId !== attendanceData[attendanceData.length - 1].mahasantriId && (
                                <Separator className="my-2 bg-muted" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
import { useEffect, useState } from "react";
import { LogHarianMahasantri } from "@/types";
import { Datepicker } from "flowbite-react";
import { format } from "date-fns";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Inbox } from "lucide-react";
const getStatusBadgeClass = (status: string): string => {
    switch (status) {
        case "Selesai":
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        case "Berjalan":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case "Belum Selesai":
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};
const getProgressColor = (percentage: number): string => {
    if (percentage >= 99.9) return "bg-green-500";
    if (percentage > 70) return "bg-blue-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-gray-400";
};


export default function AccordionLogHarian() {
    const [logData, setLogData] = useState<LogHarianMahasantri[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError("");
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');

            try {
                const authToken = localStorage.getItem("auth_token");
                if (!authToken) {
                    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/log-harian-mahasantri?tanggal=${formattedDate}`, {
                    headers: { "Authorization": `Bearer ${authToken}` },
                });

                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message || "Gagal mengambil data log harian.");
                }

                setLogData(responseData.data || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
                setError(errorMessage);
                console.error(`Gagal mengambil log harian untuk ${formattedDate}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [selectedDate]);

    // Tampilan Skeleton saat loading
    if (loading) {
        return (
            <div className="rounded-lg border bg-card shadow-sm p-4 md:p-6 space-y-4">
                <div className="h-11 w-full md:w-1/3 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-3 pt-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    return (
        <div className="rounded-lg border bg-card shadow-sm p-4 md:p-6 space-y-4">
            {/* Kontrol DatePicker */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-semibold text-lg">Detail Log Harian Mahasantri</h3>
                <div className="w-full sm:w-auto md:w-1/4">
                    <Datepicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        language="id"
                        maxDate={new Date()}
                        showTodayButton
                        labelTodayButton="Hari Ini"
                        id="tanggal"
                        className="w-full font-poppins"
                        placeholder="Pilih Tanggal"
                        showClearButton
                        labelClearButton="Bersihkan"
                        autoHide
                    />
                </div>
            </div>

            {/* Penanganan Error */}
            {error && (
                <div className="rounded-lg border bg-destructive/10 text-destructive p-4 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" /> {error}
                </div>
            )}

            {/* Tampilan Akordion */}
            {!error && (
                <Accordion type="single" collapsible className="w-full">
                    {logData.length > 0 ? logData.map(log => {
                        const percentage = log.total_target_halaman > 0 ? (log.total_selesai_halaman / log.total_target_halaman) * 100 : 0;
                        const progressColor = getProgressColor(percentage);

                        return (
                            <AccordionItem value={`item-${log.mahasantri.id}`} key={log.mahasantri.id}>
                                <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-lg hover:bg-muted/50 data-[state=open]:bg-muted/50">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="font-semibold text-left text-primary">{log.mahasantri.nama}</span>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="hidden sm:inline">{log.total_selesai_halaman} / {log.total_target_halaman} Hal</span>
                                            <Progress value={percentage} className="w-28 h-2.5" indicatorClassName={progressColor} />
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/20 text-sm">
                                    {log.detail_logs.length > 0 ? (
                                        <div className="space-y-4">
                                            {log.detail_logs.map((detail, index) => (
                                                <div key={detail.id} className={`space-y-1 ${index > 0 ? "border-t pt-4" : ""}`}>
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-semibold text-card-foreground">{detail.waktu_murojaah}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(detail.status)}`}>
                                                            {detail.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        Selesai {detail.total_selesai_halaman} dari {detail.total_target_halaman} halaman target.
                                                    </p>
                                                    {detail.catatan && <p className="text-xs text-muted-foreground pt-1 italic">"{detail.catatan}"</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-2">Tidak ada sesi yang tercatat.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-10">
                            <Inbox className="h-12 w-12 mb-2" />
                            <p className="font-semibold">Tidak Ada Data</p>
                            <p className="text-xs">Tidak ada data log yang tercatat untuk tanggal ini.</p>
                        </div>
                    )}
                </Accordion>
            )}
        </div>
    );
}
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
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
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import ToasterLayout from "@/components/ToasterLayout";
import { LogHarian, Statistik } from "@/types";
import { BarChart3, BookOpenCheck, CalendarDays, Clock, PlusCircle, Trophy, Wand2 } from "lucide-react";
import ActionDropdown from "@/components/ActionDropdown";
import DeleteDialogComponent from "@/components/dialogs/DeleteDialog";
import { Datepicker } from "flowbite-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import AddSessionDialog from "@/components/dialogs/AddSessionDialog";
import EditSessionDialog from "@/components/dialogs/EditSessionDialog";
import { formatTanggalDisplay } from "@/lib/utils";
import RekomendasiHistoryDialog from "@/components/dialogs/RekomendasiHistoryDialog";
import Footer from "@/components/Footer";

interface DetailLog {
    id: number;
    waktu_murojaah: string;
    target_start_juz: number;
    target_start_halaman: number;
    target_end_juz: number;
    target_end_halaman: number;
    total_target_halaman: number;
    selesai_end_juz: number;
    selesai_end_halaman: number;
    total_selesai_halaman: number;
    status: string;
    catatan: string;
}

const getPercentageStyles = (percentage: number) => {
    const p = Math.round(percentage) || 0;

    if (p === 100) {
        return {
            container: "bg-green-500",
            text: "text-white",
            label: "text-green-200",
        };
    }
    if (p >= 71) {
        return {
            container: "bg-blue-600",
            text: "text-white",
            label: "text-blue-200",
        };
    }
    if (p >= 31) {
        return {
            container: "bg-blue-400",
            text: "text-white",
            label: "text-blue-100",
        };
    }
    if (p > 0) {
        return {
            container: "bg-blue-100",
            text: "text-blue-800",
            label: "text-blue-600",
        };
    }
    return {
        container: "bg-gray-100",
        text: "text-gray-800",
        label: "text-gray-500",
    };
};

export default function DailyLogDashboardPage() {
    const { user } = useAuth();

    const [logHarian, setLogHarian] = useState<LogHarian | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const [statistik, setStatistik] = useState<Statistik | null>(null);
    const [statistikLoading, setStatistikLoading] = useState(true);
    const [statistikError, setStatistikError] = useState("");

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);

    // State untuk edit dialog
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedSession, setSelectedSession] = useState<DetailLog | null>(null);

    const [openAiDialog, setOpenAiDialog] = useState(false);
    const [rekomendasiHistory, setRekomendasiHistory] = useState([]);
    const [rekomendasiLoading, setRekomendasiLoading] = useState(false);

    const fetchLogHarian = async (dateString: string) => {
        setLoading(true);
        setError("");
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/log-harian`);

            url.searchParams.append('tanggal', dateString);

            const response = await fetch(url.toString(), {
                headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` },
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Gagal mengambil data log harian");
            }

            setLogHarian(responseData.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistik = async () => {
        setStatistikLoading(true);
        setStatistikError("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/log-harian/statistik`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` },
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Gagal mengambil data statistik");
            }
            setStatistik(responseData.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            setStatistikError(errorMessage);
        } finally {
            setStatistikLoading(false);
        }
    };

    const handleOpenAiDialog = async () => {
        setOpenAiDialog(true);
        setRekomendasiLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/rekomendasi?limit=10`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` },
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Gagal mengambil riwayat rekomendasi");
            }
            setRekomendasiHistory(responseData.data.riwayat_rekomendasi || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(errorMessage);
        } finally {
            setRekomendasiLoading(false);
        }
    };

    useEffect(() => {
        if (user && selectedDate) {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            fetchLogHarian(formattedDate);
        }
    }, [selectedDate, user]);

    useEffect(() => {
        if (user) {
            fetchStatistik();
        }
    }, [user]);

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleDeleteDetailLog = async () => {
        if (!selectedId) return;

        const toastId = toast.loading("Menghapus sesi...");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/log-harian/detail/${selectedId}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal menghapus sesi");
            }

            toast.success("Sesi murojaah berhasil dihapus!", { id: toastId });
            fetchLogHarian(format(selectedDate, 'yyyy-MM-dd'));
            fetchStatistik();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setOpenDialog(false);
            setSelectedId(null);
        }
    };

    const handleEditSession = (session: DetailLog) => {
        setSelectedSession(session);
        setOpenEditDialog(true);
    };

    const handleEditSuccess = () => {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        fetchLogHarian(formattedDate);
        fetchStatistik();
        setSelectedSession(null);
    };

    const percentage = logHarian && logHarian.total_target_halaman > 0
        ? (logHarian.total_selesai_halaman / logHarian.total_target_halaman) * 100
        : 0;

    const percentageStyle = getPercentageStyles(percentage);

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
                                        <BreadcrumbPage className="text-primary">Murojaah Harian</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <main className="p-4 md:p-6 flex flex-1 flex-col gap-4">
                        {/* Kontrol dan Rekapitulasi */}
                        <div className="flex flex-col xl:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Log Murojaah Harian</h1>
                                <p className="text-muted-foreground">Catat dan pantau progres murojaah Anda setiap hari.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {selectedDate && (
                                    <div>
                                        <div className="px-3 py-2 rounded-sm bg-[#2E649C] text-white">
                                            <h1 className="font-semibold text-xl">
                                                {format(selectedDate, "EEEE", { locale: id })}
                                            </h1>
                                        </div>
                                    </div>
                                )}

                                <Datepicker
                                    value={selectedDate}
                                    id="tanggal"
                                    className="w-full font-poppins"
                                    placeholder="Pilih Tanggal"
                                    showTodayButton
                                    labelTodayButton="Hari Ini"
                                    showClearButton
                                    labelClearButton="Bersihkan"
                                    language="id"
                                    autoHide
                                    onChange={handleDateChange}
                                    maxDate={new Date()}
                                />
                                <Button onClick={handleOpenAiDialog} className="bg-blue-600 hover:bg-blue-700 gap-2">
                                    <Wand2 className="h-4 w-4" />
                                    Gunakan Rekomendasi AI
                                </Button>
                                <Button onClick={() => setOpenAddDialog(true)} className="gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    Tambah Sesi
                                </Button>
                            </div>
                        </div>

                        {/* --- WIDGET STATISTIK KESELURUHAN --- */}
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold tracking-tight">Statistik Keseluruhan</h2>
                            {statistikLoading ? (
                                <div className="text-center p-4 text-muted-foreground">Memuat statistik...</div>
                            ) : statistikError ? (
                                <div className="text-center p-4 text-red-500">{statistikError}</div>
                            ) : statistik && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                    {/* Card: Total Halaman */}
                                    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <BookOpenCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Halaman Dibaca</p>
                                            <p className="text-2xl font-bold">{statistik.total_selesai_halaman}</p>
                                        </div>
                                    </div>

                                    {/* Card: Hari Aktif */}
                                    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-start gap-4">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                            <CalendarDays className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Hari Aktif</p>
                                            <p className="text-2xl font-bold">{statistik.total_hari_aktif}</p>
                                        </div>
                                    </div>

                                    {/* Card: Rata-rata Harian */}
                                    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-start gap-4">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <BarChart3 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Rata-rata Per Hari</p>
                                            <p className="text-2xl font-bold">{statistik.rata_rata_halaman_per_hari.toFixed(1)}</p>
                                        </div>
                                    </div>

                                    {/* Card: Waktu Produktif */}
                                    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-start gap-4">
                                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Waktu Terproduktif</p>
                                            <p className="text-lg font-semibold">{statistik.sesi_paling_produktif}</p>
                                        </div>
                                    </div>

                                    {/* Card: Hari Terproduktif */}
                                    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-start gap-4">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Top Day</p>
                                            <p className="text-lg font-semibold">{formatTanggalDisplay(statistik.hari_paling_produktif.tanggal)}</p>
                                            <p className="text-xs text-muted-foreground">{statistik.hari_paling_produktif.total_selesai_halaman} Halaman</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="my-3 border-t-2 border-gray-300/50" />

                        {/* Kartu Statistik Harian */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm font-medium text-muted-foreground">Tanggal Log</div>
                                <div className="text-2xl font-bold">
                                    {formatTanggalDisplay(logHarian?.tanggal)}
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm font-medium text-muted-foreground">Total Target</div>
                                <div className="text-2xl font-bold">{logHarian?.total_target_halaman || 0} Halaman</div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm font-medium text-muted-foreground">Total Selesai</div>
                                <div className="text-2xl font-bold">{logHarian?.total_selesai_halaman || 0} Halaman</div>
                            </div>
                            <div className={`rounded-lg p-4 transition-colors duration-300 ${percentageStyle.container}`}>
                                <div className={`text-sm font-medium ${percentageStyle.label}`}>
                                    Persentase
                                </div>
                                <div className={`text-2xl font-bold ${percentageStyle.text}`}>
                                    {percentage.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Tabel Detail Log */}
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
                            <div className="p-6 flex flex-row items-center justify-between">
                                <div className="space-y-1.5">
                                    <h3 className="text-2xl font-semibold leading-none tracking-tight">Detail Sesi Murojaah</h3>
                                    <p className="text-sm text-muted-foreground">Daftar sesi murojaah Anda untuk tanggal yang dipilih.</p>
                                </div>
                            </div>
                            <div className="p-0">
                                <div className="overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Target Murojaah</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Waktu</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Target (Hal.)</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Selesai (Hal.)</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Status</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Memuat data...</td>
                                                </tr>
                                            ) : error ? (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-red-500">{error}</td>
                                                </tr>
                                            ) : logHarian?.detail_logs && logHarian.detail_logs.length > 0 ? (
                                                logHarian.detail_logs.map((detail) => (
                                                    <tr key={detail.id} className="border-b flex flex-col p-4 mb-2 bg-muted/20 rounded-lg md:table-row md:p-0 md:mb-0 md:bg-transparent">
                                                        <td className="p-2 align-middle font-medium md:p-4 md:table-cell" data-label="Target:">
                                                            {`Juz ${detail.target_start_juz} Hal ${detail.target_start_halaman} - Juz ${detail.target_end_juz} Hal ${detail.target_end_halaman}`}
                                                        </td>
                                                        <td className="p-2 align-middle text-muted-foreground md:p-4 md:table-cell" data-label="Waktu:">
                                                            {detail.waktu_murojaah}
                                                        </td>
                                                        <td className="p-2 align-middle md:p-4 md:table-cell" data-label="Target:">
                                                            {detail.total_target_halaman}
                                                        </td>
                                                        <td className="p-2 align-middle md:p-4 md:table-cell" data-label="Selesai:">
                                                            {detail.total_selesai_halaman}
                                                        </td>
                                                        <td className="p-2 align-middle md:p-4 md:table-cell" data-label="Status:">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full
                                                             ${detail.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                                                                    detail.status === 'Berjalan' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {detail.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 align-middle md:p-4 md:table-cell" data-label="Aksi:">
                                                            <ActionDropdown
                                                                row={{ original: detail }}
                                                                onEdit={() => handleEditSession(detail)}
                                                                keyword="Sesi Murojaah"
                                                                setOpenDialog={setOpenDialog}
                                                                setSelectedId={setSelectedId}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Belum ada sesi untuk tanggal ini.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
            <Footer />

            {/* Dialog konfirmasi hapus */}
            <DeleteDialogComponent
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                handleDelete={handleDeleteDetailLog}
                keyword="Sesi Murojaah"
            />

            {/* Dialog tambah sesi */}
            <AddSessionDialog
                open={openAddDialog}
                onOpenChange={setOpenAddDialog}
                selectedDate={selectedDate}
                onSuccess={() => {
                    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                    fetchLogHarian(formattedDate);
                    fetchStatistik();
                }}
            />

            {/* Dialog edit sesi */}
            <EditSessionDialog
                open={openEditDialog}
                onOpenChange={setOpenEditDialog}
                sessionData={selectedSession}
                onSuccess={handleEditSuccess}
            />

            <RekomendasiHistoryDialog
                open={openAiDialog}
                onOpenChange={setOpenAiDialog}
                historyData={rekomendasiHistory}
                loading={rekomendasiLoading}
                onSuccess={() => {
                    if (selectedDate) {
                        fetchLogHarian(format(selectedDate, 'yyyy-MM-dd'));
                    }
                }}
            />
        </>
    )
}
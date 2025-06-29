/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/widget/StatCard";
import { BookOpen, Users } from "lucide-react";
import { Absensi, AbsensiCount, MahasantriWithHafalan } from "@/types";
import MahasantriDialog from "@/components/dialogs/MahasantriDialog";
import SetoranDialog from "@/components/dialogs/SetoranDialog";
import { fetchHafalanByMentor } from "@/utils/fetchHalaman";
import { processSetoranData, processSetoranDataPerMahasantri } from "@/utils/dataProcessing";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, ChartData, Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { jwtDecode } from "jwt-decode";
import { handleLogout } from "@/lib/utils";
import TimeWidget from "@/components/widget/TimeWidget";
import { Card } from "@/components/ui/card";
import TodaySetoranList from "@/components/widget/TodaySetoranList";
import AttendanceWidget from "@/components/widget/AttendanceWidget";
import AbsensiDialog from "@/components/dialogs/AbsensiDialog";
import TodayAttendanceList from "@/components/widget/TodayAttendanceWidget";
import Footer from "@/components/Footer";

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, BarElement, PointElement);

const options = {
    responsive: true,
    scales: {
        x: {
            beginAtZero: true
        }
    },
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");
    const [totalMahasantri, setTotalMahasantri] = useState(0);
    const [totalHafalan, setTotalHafalan] = useState(0);
    const [mahasantriList, setMahasantriList] = useState<MahasantriWithHafalan[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHafalanDialogOpen, setIsHafalanDialogOpen] = useState(false);

    const [absensiData, setAbsensiData] = useState({
        total: 0,
        hadir: 0,
        izin: 0,
        alpa: 0
    });
    const [absensiDetails, setAbsensiDetails] = useState<Absensi[]>([]);
    const [isAbsensiDialogOpen, setIsAbsensiDialogOpen] = useState(false);
    const [absensiCurrentPage, setAbsensiCurrentPage] = useState(1);

    // Chart states
    const [chartData, setChartData] = useState<ChartData<'line', number[], string> | null>(null);
    const [barChartData, setBarChartData] = useState<ChartData<'bar', number[], string> | null>(null);
    const [absensiChartData, setAbsensiChartData] = useState<ChartData<'bar', number[], string> | null>(null);
    const [absensiLineChartData, setAbsensiLineChartData] = useState<ChartData<'line', number[], string> | null>(null);

    // Pagination states for Mahasantri and Setoran
    const [currentPage, setCurrentPage] = useState(1);
    const [setoranCurrentPage, setSetoranCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const setoranPerPage = 10;
    const totalPages = Math.ceil(mahasantriList.length / itemsPerPage);

    const paginatedMahasantri = mahasantriList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const allSetoran = mahasantriList?.flatMap((m) =>
        m.list_hafalan?.map((h) => ({
            ...h,
            nama: m.mahasantri?.nama || 'Tanpa Nama',
        })) || []
    ) || [];

    // Pagination logic for Setoran
    const totalSetoranPages = Math.ceil(allSetoran.length / setoranPerPage);
    const paginatedSetoran = allSetoran.slice(
        (setoranCurrentPage - 1) * setoranPerPage,
        setoranCurrentPage * setoranPerPage
    );

    const user = JSON.parse(localStorage.getItem("user") ?? '{}');
    const token = localStorage.getItem("auth_token") ?? '';

    useEffect(() => {
        if (!user || user.user_type !== "mentor") {
            navigate("/auth/login");
            return;
        }

        const userId = user.id;
        setUserName(user.nama);
        setTotalMahasantri(user.mahasantri_count);

        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);

            if ((decoded.exp ?? 0) < currentTime) {
                handleLogout(navigate)
                return
            }
        } catch (error) {
            handleLogout(navigate)
            console.error("Error decoding token:", error);
            return
        }

        const fetchData = async () => {
            try {
                const mahasantriList = await fetchHafalanByMentor(userId, token);
                const safeMahasantriList = mahasantriList || [];
                setMahasantriList(safeMahasantriList);

                // Handle array kosong saat menghitung total
                const total = safeMahasantriList.reduce(
                    (acc: number, item: MahasantriWithHafalan) => acc + (item.list_hafalan?.length || 0),
                    0
                );
                setTotalHafalan(total);

                // Proses data untuk Line Chart
                const processedData = processSetoranData(safeMahasantriList);
                const chartLabels = processedData.map((item) => item.date);
                const ziyadahLineData = processedData.map((item) => item.kategori.ziyadah || 0);
                const murojaahLineData = processedData.map((item) => item.kategori.murojaah || 0);

                setChartData({
                    labels: chartLabels,
                    datasets: [
                        {
                            label: "Ziyadah",
                            data: ziyadahLineData,
                            borderColor: "rgb(75, 192, 192)",
                            tension: 0.5,
                            fill: true,
                        },
                        {
                            label: "Murojaah",
                            data: murojaahLineData,
                            borderColor: "#578FCA",
                            tension: 0.5,
                            fill: true,
                        },
                    ],
                });

                // Proses data untuk Bar Chart (Ziyadah & Murojaah per Mahasantri)
                const processedSetoranPerMahasantri = processSetoranDataPerMahasantri(safeMahasantriList);
                const barLabels = processedSetoranPerMahasantri.map((item) => item.nama);
                const ziyadahBarData = processedSetoranPerMahasantri.map((item) => item.ziyadah);
                const murojaahBarData = processedSetoranPerMahasantri.map((item) => item.murojaah);

                setBarChartData({
                    labels: barLabels,
                    datasets: [
                        {
                            label: "Ziyadah",
                            data: ziyadahBarData,
                            backgroundColor: "#2E649C",
                        },
                        {
                            label: "Murojaah",
                            data: murojaahBarData,
                            backgroundColor: "#578FCA",
                        },
                    ],
                });
            } catch (error) {
                console.error("Gagal fetch data:", error);
                setMahasantriList([]);
                setTotalHafalan(0)
            }
        };

        const fetchAbsensi = async () => {
            try {
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yyyy = today.getFullYear();
                const todayStr = `${dd}-${mm}-${yyyy}`;

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/absensi?mentor_id=${userId}&tanggal=${todayStr}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    setAbsensiData({ total: 0, hadir: 0, izin: 0, alpa: 0 });
                    setAbsensiDetails([]);
                    return;
                }

                const data = await response.json();
                if (data.status) {
                    const absensi = data.data.absensi;
                    setAbsensiDetails(absensi);

                    setAbsensiData({
                        total: absensi.length,
                        hadir: absensi.filter((a: { status: string }) => a.status === 'hadir').length,
                        izin: absensi.filter((a: { status: string }) => a.status === 'izin').length,
                        alpa: absensi.filter((a: { status: string }) => a.status === 'alpa').length
                    });
                }
            } catch (error) {
                console.error('Gagal mengambil data absensi:', error);
                setAbsensiData({ total: 0, hadir: 0, izin: 0, alpa: 0 });
                setAbsensiDetails([]);
            }
        };

        const fetchAbsensiData = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/absensi?mentor_id=${user.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    console.error("Gagal mengambil data absensi");
                    return;
                }

                const data = await response.json();
                if (data.status) {
                    const absensi = data.data.absensi;

                    const parseTanggal = (tanggalStr: string) => {
                        const [day, month, year] = tanggalStr.split('-').map(part => parseInt(part, 10));
                        return { day, month, year, original: tanggalStr };
                    };

                    const sortedAbsensi = [...absensi].sort((a, b) => {
                        const dateA = parseTanggal(a.tanggal);
                        const dateB = parseTanggal(b.tanggal);

                        if (dateA.year !== dateB.year) return dateA.year - dateB.year;
                        if (dateA.month !== dateB.month) return dateA.month - dateB.month;
                        return dateA.day - dateB.day;
                    });

                    // Ambil hanya 7 hari terakhir untuk tampilan yang lebih baik
                    const uniqueDates = Array.from(new Set(sortedAbsensi.map(item => item.tanggal)));
                    const last7Dates = uniqueDates.slice(-7); // Ambil 7 tanggal terakhir

                    // Proses data untuk chart
                    const absensiCount: AbsensiCount = {};

                    // Inisialisasi semua tanggal yang akan ditampilkan
                    last7Dates.forEach(date => {
                        absensiCount[date] = { hadir: 0, izin: 0, alpa: 0 };
                    });

                    // Hitung jumlah status per tanggal
                    sortedAbsensi.forEach(item => {
                        if (last7Dates.includes(item.tanggal)) {
                            switch (item.status) {
                                case 'hadir':
                                    absensiCount[item.tanggal].hadir += 1;
                                    break;
                                case 'izin':
                                    absensiCount[item.tanggal].izin += 1;
                                    break;
                                case 'alpa':
                                    absensiCount[item.tanggal].alpa += 1;
                                    break;
                                default:
                                    console.error(`Unknown status: ${item.status}`);
                            }
                        }
                    });

                    // Format tanggal untuk label chart: "DD/MM"
                    const formattedLabels = last7Dates.map(date => {
                        const [day, month] = date.split('-');
                        return `${day}/${month}`;
                    });

                    const hadirData = last7Dates.map(date => absensiCount[date].hadir);
                    const izinData = last7Dates.map(date => absensiCount[date].izin);
                    const alpaData = last7Dates.map(date => absensiCount[date].alpa);

                    // Set data untuk Bar Chart
                    setAbsensiChartData({
                        labels: formattedLabels,
                        datasets: [
                            {
                                label: "Hadir",
                                data: hadirData,
                                backgroundColor: "#4CAF50", // Hijau
                                borderColor: "#388E3C", // Hijau Gelap
                                borderWidth: 1,
                            },
                            {
                                label: "Izin",
                                data: izinData,
                                backgroundColor: "#2196F3",
                                borderColor: "#1976D2",
                                borderWidth: 1,
                            },
                            {
                                label: "Alpa",
                                data: alpaData,
                                backgroundColor: "#F44336",
                                borderColor: "#D32F2F",
                                borderWidth: 1,
                            }
                        ]
                    });

                    // Set data untuk Line Chart
                    setAbsensiLineChartData({
                        labels: formattedLabels,
                        datasets: [
                            {
                                label: "Hadir",
                                data: hadirData,
                                backgroundColor: "rgba(76, 175, 80, 0.2)",
                                borderColor: "#388E3C",
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: "#4CAF50",
                                pointRadius: 4,
                            },
                            {
                                label: "Izin",
                                data: izinData,
                                backgroundColor: "rgba(33, 150, 243, 0.2)",
                                borderColor: "#1976D2",
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: "#2196F3",
                                pointRadius: 4,
                            },
                            {
                                label: "Alpa",
                                data: alpaData,
                                backgroundColor: "rgba(244, 67, 54, 0.2)",
                                borderColor: "#D32F2F",
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: "#F44336",
                                pointRadius: 4,
                            }
                        ]
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil data absensi:", error);
            }
        };

        fetchData();
        fetchAbsensi();
        fetchAbsensiData();
    }, []);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleSetoranPrevPage = () => {
        setSetoranCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleSetoranNextPage = () => {
        setSetoranCurrentPage((prev) => Math.min(prev + 1, totalSetoranPages));
    };


    return (
        <>
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
                                        <BreadcrumbPage className="text-primary">Dashboard</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0  font-poppins">
                        <h1 className="text-2xl lg:text-4xl font-semibold bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-black mt-4">
                            <span className="inline-flex items-center space-x-3">
                                <span>Welcome, Ust. {userName}</span>
                            </span>
                        </h1>

                        <TimeWidget />

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                title="Total Mahasantri"
                                value={totalMahasantri}
                                icon={<Users className="h-6 w-6" />}
                                onClick={() => setIsDialogOpen(true)}
                                gradient="blue"
                                className="hover:border-purple-100 md:col-span-1"
                            />

                            <StatCard
                                title="Total Setoran"
                                value={`${totalHafalan} Setoran`}
                                icon={<BookOpen className="h-6 w-6" />}
                                onClick={() => setIsHafalanDialogOpen(true)}
                                gradient="green"
                                className="hover:border-green-100 md:col-span-1"
                            />

                        </div>
                        <AttendanceWidget
                            total={absensiData.total}
                            hadir={absensiData.hadir}
                            izin={absensiData.izin}
                            alpa={absensiData.alpa}
                            onViewDetails={() => setIsAbsensiDialogOpen(true)}
                        />

                        {/* Time Widget & Today Setoran List    */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TodayAttendanceList className="lg:col-span-1 md:col-span-2" />
                            <TodaySetoranList className="lg:col-span-1 md:col-span-2" />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Line Chart */}
                            <Card className="p-4 md:p-6">
                                <div className="flex flex-col h-full">
                                    {/* Chart Header */}
                                    <div className="pb-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                                                    📈
                                                </span>
                                                Tren Harian Setoran
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Perkembangan ziyadah & murojaah per hari
                                        </p>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="relative h-[300px] md:h-[400px] mt-4">
                                        {chartData && (
                                            <Line
                                                data={chartData}
                                                options={{
                                                    ...options,
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top' as const,
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Bar Chart */}
                            <Card className="p-4 md:p-6">
                                <div className="flex flex-col h-full">
                                    {/* Chart Header */}
                                    <div className="pb-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <span className="bg-purple-100 text-purple-800 p-2 rounded-lg">
                                                    📊
                                                </span>
                                                Setoran per Mahasantri
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Perbandingan ziyadah & murojaah per santri
                                        </p>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="relative h-[300px] md:h-[400px] mt-4">
                                        {barChartData && (
                                            <Bar
                                                data={barChartData}
                                                options={{
                                                    ...options,
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    indexAxis: 'y' as const,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top' as const,
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Chart Absensi Line */}
                            <Card className="p-4 md:p-6">
                                <div className="flex flex-col h-full">
                                    <div className="pb-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <span className="bg-green-100 text-green-800 p-2 rounded-lg">
                                                    📈
                                                </span>
                                                Tren Absensi 30 Hari Terakhir
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Perkembangan absensi dari waktu ke waktu
                                        </p>
                                    </div>

                                    <div className="relative h-[300px] md:h-[400px] mt-4">
                                        {absensiLineChartData ? (
                                            <Line
                                                data={absensiLineChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Tanggal'
                                                            }
                                                        },
                                                        y: {
                                                            title: {
                                                                display: true,
                                                                text: 'Jumlah'
                                                            },
                                                            beginAtZero: true
                                                        }
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            position: 'top' as const,
                                                        },
                                                        tooltip: {
                                                            mode: 'index' as const,
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Memuat data absensi...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Chart Absensi */}
                            <Card className="p-4 md:p-6">
                                <div className="flex flex-col h-full">
                                    <div className="pb-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <span className="bg-red-100 text-red-800 p-2 rounded-lg">
                                                    📅
                                                </span>
                                                Rekapitulasi Absensi
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Statistik absensi harian seluruh mahasantri
                                        </p>
                                    </div>

                                    <div className="relative h-[300px] md:h-[400px] mt-4">
                                        {absensiChartData ? (
                                            <Bar
                                                data={absensiChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        x: {
                                                            stacked: true,
                                                        },
                                                        y: {
                                                            stacked: true,
                                                            beginAtZero: true
                                                        }
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            position: 'top' as const,
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Distribusi Absensi per Hari'
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Memuat data absensi...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Mahasantri Alert Dialog */}
                        <MahasantriDialog
                            open={isDialogOpen}
                            onClose={() => setIsDialogOpen(false)}
                            data={paginatedMahasantri}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPrev={handlePrevPage}
                            onNext={handleNextPage}
                        />

                        {/* Hafalan Alert Dialog */}
                        <SetoranDialog
                            open={isHafalanDialogOpen}
                            onClose={() => setIsHafalanDialogOpen(false)}
                            data={paginatedSetoran}
                            currentPage={setoranCurrentPage}
                            totalPages={totalSetoranPages}
                            onPrev={handleSetoranPrevPage}
                            onNext={handleSetoranNextPage}
                        />

                        <AbsensiDialog
                            open={isAbsensiDialogOpen}
                            onClose={() => setIsAbsensiDialogOpen(false)}
                            data={absensiDetails.slice((absensiCurrentPage - 1) * 5, absensiCurrentPage * 5)}
                            currentPage={absensiCurrentPage}
                            totalPages={Math.ceil(absensiDetails.length / 5)}
                            onPageChange={(page) => setAbsensiCurrentPage(page)}
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <Footer />
        </>
    );
}

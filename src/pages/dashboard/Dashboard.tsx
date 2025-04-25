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
import { MahasantriWithHafalan } from "@/types";
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
    const [chartData, setChartData] = useState<ChartData<'line', number[], string> | null>(null);
    const [barChartData, setBarChartData] = useState<ChartData<'bar', number[], string> | null>(null);

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

    const allSetoran = mahasantriList.flatMap((m) =>
        m.list_hafalan.map((h) => ({
            ...h,
            nama: m.mahasantri.nama,
        }))
    );

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
            navigate("/auth/mentor/login");
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
                setMahasantriList(mahasantriList);

                const total = mahasantriList.reduce(
                    (acc: number, item: MahasantriWithHafalan) => acc + item.list_hafalan.length,
                    0
                );
                setTotalHafalan(total);

                // Proses data untuk Line Chart (Ziyadah & Murojaah per tanggal)
                const processedData = processSetoranData(mahasantriList);
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
                const processedSetoranPerMahasantri = processSetoranDataPerMahasantri(mahasantriList);
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
            }
        };

        fetchData();
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
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-100 font-poppins">
                    <h1 className="text-2xl lg:text-4xl font-semibold bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-black mt-4">
                        <span className="inline-flex items-center space-x-3">
                            <span>Welcome, Ust. {userName}🙏</span>
                        </span>
                    </h1>

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

                    {/* Time Widget & Today Setoran List    */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TimeWidget className="lg:col-span-1 md:col-span-2" />
                        <TodaySetoranList className="lg:col-span-1 md:col-span-2" />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Line Chart Container */}
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

                        {/* Bar Chart Container */}
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
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AbsensiDailySummary, CsvColumnConfig, Mahasantri, Mentor } from "@/types";
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle, Clipboard, Sun, Plus, ChevronDown, CalendarSearch } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DataTable from "@/components/DataTable";
import { Toaster } from "react-hot-toast";
import MahasantriFilter from "@/components/filter/MahasantriFilter";
import { authCheck } from "@/lib/utils";
import DateFilter from "@/components/filter/DateFilter";
import MentorFilter from "@/components/filter/MentorFilter";
import { CsvExportButton } from "@/components/CsvExportButton";
import { exportToCSV } from "@/utils/exportCsv";
import { format, parse } from "date-fns";
import { id } from 'date-fns/locale';

export default function AbsensiPage() {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mahasantriData, setMahasantriData] = useState<Mahasantri[]>([]);
    const [absensiData, setAbsensiData] = useState<AbsensiDailySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedMentorId, setSelectedMentorId] = useState<string | undefined>(undefined);
    const [selectedMahasantriId, setSelectedMahasantriId] = useState<string | undefined>();
    const [columnVisibility, setColumnVisibility] = useState({});

    const [selectedMahasantri, setSelectedMahasantri] = useState<Mahasantri | undefined>(undefined);

    // Ambil bulan dan tahun saat ini
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString().padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());

    useEffect(() => {
        const fetchInitialData = async () => {
            if (authCheck()) {
                try {
                    setLoading(true);

                    // Fetch mentors first
                    const mentorsResponse = await fetch(
                        `${import.meta.env.VITE_API_URL}/mentors?page=1&limit=16`
                    );

                    if (!mentorsResponse.ok) throw new Error("Gagal mengambil data mentor");

                    const mentorsData = await mentorsResponse.json();

                    if (mentorsData.status) {
                        setMentors(mentorsData.data.mentors);
                    }

                    await fetchMahasantriData(1, "");
                } catch (err) {
                    setError("Gagal memuat data awal");
                    console.error("Initial fetch error:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchInitialData();
    }, []);

    const fetchMahasantriData = async (page: number, search: string) => {
        try {
            setLoading(true);
            const url = new URL(`${import.meta.env.VITE_API_URL}/mahasantri`);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '1000');
            if (search) {
                url.searchParams.append('nama', search);
            }
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error("Gagal mengambil data mahasantri");
            const data = await response.json();
            if (data.status) {
                setMahasantriData(data.data.mahasantri)
            }
        } catch (err) {
            setError("Gagal memuat data mahasantri");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAbsensiData = async (mahasantri_id: number, selectedMonth: string, selectedYear: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi/mahasantri/${mahasantri_id}/daily-summary?month=${selectedMonth}&year=${selectedYear}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`
                }
            });

            if (!response.ok) throw new Error("Gagal mengambil data absensi");

            const data = await response.json();

            if (data.status) {
                setAbsensiData(data.data.daily_summary);
            }
        } catch (err) {
            setError("Gagal memuat data absensi");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter by Mentor
    const handleMentorFilter = async (mentorId: string) => {
        setSelectedMentorId(mentorId === "all" ? undefined : mentorId);
        if (mentorId === "all") {
            setMahasantriData([]);
            await fetchMahasantriData(1, "");
        } else {
            const filteredMahasantri = mahasantriData.filter(mahasantri => mahasantri.mentor_id === parseInt(mentorId));
            setMahasantriData(filteredMahasantri);
            setSelectedMahasantriId(undefined);
            setAbsensiData([]);
        }
    };

    const handleMahasantriFilter = async (mahasantriId: string) => {
        if (mahasantriId === "all") {
            setSelectedMahasantriId(undefined);
            setSelectedMahasantri(undefined);
            setAbsensiData([]);
        } else {
            const selected = mahasantriData.find(mahasantri => mahasantri.id === parseInt(mahasantriId))
            setSelectedMahasantriId(mahasantriId);
            setSelectedMahasantri(selected);
            await fetchAbsensiData(parseInt(mahasantriId), selectedMonth, selectedYear);
        }
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
        if (selectedMahasantriId) {
            fetchAbsensiData(parseInt(selectedMahasantriId), month, selectedYear);
        }
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        if (selectedMahasantriId) {
            fetchAbsensiData(parseInt(selectedMahasantriId), selectedMonth, year);
        }
    };

    // Definisi Kolom Tabel
    const columns = useMemo<ColumnDef<AbsensiDailySummary>[]>(() => [
        {
            id: "tanggal",
            accessorKey: "tanggal",
            header: "Tanggal",
            cell: ({ row }) => {
                const dateStr = row.getValue("tanggal") as string
                const date = parse(dateStr, 'dd-MM-yyyy', new Date())

                const formattedDate = format(date, 'EEEE, dd MMM yyyy', { locale: id });

                return <span>{formattedDate}</span>
            },
        },
        {
            id: "shubuh",
            accessorKey: "shubuh",
            header: "Shubuh",
            cell: ({ row }) => {
                const shubuhStatus = row.getValue("shubuh");
                let statusClass = '';
                let statusText = '';
                let Icon = null;

                switch (shubuhStatus) {
                    case 'hadir':
                        statusClass = 'bg-green-200 text-green-800';
                        statusText = 'Hadir';
                        Icon = <CheckCircle className="h-4 w-4 mr-1" />;
                        break;
                    case 'belum-absen':
                        statusClass = 'bg-yellow-200 text-yellow-800';
                        statusText = 'Belum Absen';
                        Icon = <HelpCircle className="h-4 w-4 mr-1" />;
                        break;
                    case 'izin':
                        statusClass = 'bg-blue-200 text-blue-800';
                        statusText = 'Izin';
                        Icon = <Clipboard className="h-4 w-4 mr-1" />;
                        break;
                    case 'libur':
                        statusClass = 'bg-gray-200 text-gray-800';
                        statusText = 'Libur';
                        Icon = <Sun className="h-4 w-4 mr-1" />;
                        break;
                    case 'absen':
                        statusClass = 'bg-red-200 text-red-800';
                        statusText = 'Absen';
                        Icon = <XCircle className="h-4 w-4 mr-1" />;
                        break;
                    default:
                        statusClass = 'bg-gray-200 text-gray-800';
                        statusText = 'Tidak Diketahui';
                        Icon = <HelpCircle className="h-4 w-4 mr-1" />;
                }

                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                        {Icon}
                        {statusText}
                    </span>
                );
            }
        },
        {
            id: "isya",
            accessorKey: "isya",
            header: "Isya",
            cell: ({ row }) => {
                const isyaStatus = row.getValue("isya");
                let statusClass = '';
                let statusText = '';
                let Icon = null;

                switch (isyaStatus) {
                    case 'hadir':
                        statusClass = 'bg-green-200 text-green-800';
                        statusText = 'Hadir';
                        Icon = <CheckCircle className="h-4 w-4 mr-1" />;
                        break;
                    case 'belum-absen':
                        statusClass = 'bg-yellow-200 text-yellow-800';
                        statusText = 'Belum Absen';
                        Icon = <HelpCircle className="h-4 w-4 mr-1" />;
                        break;
                    case 'izin':
                        statusClass = 'bg-blue-200 text-blue-800';
                        statusText = 'Izin';
                        Icon = <Clipboard className="h-4 w-4 mr-1" />;
                        break;
                    case 'libur':
                        statusClass = 'bg-gray-200 text-gray-800';
                        statusText = 'Libur';
                        Icon = <Sun className="h-4 w-4 mr-1" />;
                        break;
                    case 'absen':
                        statusClass = 'bg-red-200 text-red-800';
                        statusText = 'Absen';
                        Icon = <XCircle className="h-4 w-4 mr-1" />;
                        break;
                    default:
                        statusClass = 'bg-gray-200 text-gray-800';
                        statusText = 'Tidak Diketahui';
                        Icon = <HelpCircle className="h-4 w-4 mr-1" />;
                }

                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                        {Icon}
                        {statusText}
                    </span>
                );
            }
        },
    ], []);

    const table = useReactTable({
        data: absensiData,
        columns,
        state: {
            sorting,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleExportDailySummary = () => {
        const columns: CsvColumnConfig<AbsensiDailySummary>[] = [
            {
                key: 'tanggal',
                header: 'Tanggal',
            },
            {
                key: 'shubuh',
                header: 'Shubuh',
            },
            {
                key: "isya",
                header: "Isya",
            }
        ];

        const mahasantriName = selectedMahasantri && selectedMahasantri.nama;

        exportToCSV(
            absensiData,
            columns,
            `Rekap Absensi ${mahasantriName} - ${selectedMonth} ${selectedYear}`
        );
    };

    console.log(selectedMahasantri);

    return (
        <>
            <Toaster position="top-right" />
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
                                        <BreadcrumbPage className="text-primary">Absensi Halaqoh</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col mt-4 gap-4 p-4 pt-0">
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="p-6 pb-0">
                                    <h2 className="text-2xl font-bold">Rekap Absensi Mahasantri</h2>
                                    <p className="text-muted-foreground mt-2">
                                        Pilih mentor, mahasantri, dan bulan untuk melihat rekap absensi
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 p-6">
                                    <Button
                                        type="button"
                                        onClick={() => navigate('/dashboard/absensi/add')}
                                        className="cursor-pointer"
                                    >
                                        <Plus />
                                        Input Absensi
                                    </Button>

                                    <CsvExportButton onClick={handleExportDailySummary} />

                                    <Button
                                        type="button"
                                        onClick={() => navigate('/dashboard/absensi/detail')}
                                        className="cursor-pointer bg-[var(--primary-1)] hover:bg-[var(--primary-2)]"
                                    >
                                        <CalendarSearch />
                                        Detail Absensi
                                    </Button>
                                </div>
                            </div>
                            <div className="relative overflow-x-auto p-6">
                                {error ? (
                                    <div className="text-red-500 text-center py-8">{error}</div>
                                ) : loading ? (
                                    <div className="space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full flex flex-wrap gap-4 py-4 justify-between items-start lg:items-center sm:gap-4">
                                            <div className="flex flex-wrap gap-4">
                                                {/* Filter Mentor */}
                                                <MentorFilter
                                                    selectedMentorId={selectedMentorId}
                                                    mentors={mentors}
                                                    handleMentorFilter={handleMentorFilter}
                                                />

                                                {/* Filter Mahasantri */}
                                                <MahasantriFilter
                                                    mahasantriData={mahasantriData}
                                                    handleMahasantriFilter={handleMahasantriFilter}
                                                    selectedMahasantriId={selectedMahasantriId}
                                                />

                                                {/* Filter Bulan dan Tahun */}
                                                <DateFilter
                                                    selectedMonth={selectedMonth}
                                                    selectedYear={selectedYear}
                                                    handleMonthChange={handleMonthChange}
                                                    handleYearChange={handleYearChange}
                                                />
                                            </div>

                                            {/* Dropdown untuk Kolom */}
                                            <div className="w-full sm:w-auto">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full sm:w-[140px] justify-between"
                                                        >
                                                            Columns
                                                            <ChevronDown className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {table
                                                            .getAllColumns()
                                                            .filter((column) => column.getCanHide())
                                                            .map((column) => (
                                                                <DropdownMenuCheckboxItem
                                                                    key={column.id}
                                                                    className="capitalize"
                                                                    checked={column.getIsVisible()}
                                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                                >
                                                                    {column.id
                                                                        .replace(/_/g, ' ')
                                                                        .replace(/^\w/, (c) => c.toUpperCase())
                                                                    }
                                                                </DropdownMenuCheckboxItem>
                                                            ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Tampilkan Data Tabel */}
                                        <DataTable
                                            columns={columns}
                                            data={absensiData}
                                            sorting={sorting}
                                            onSortingChange={setSorting}
                                            columnVisibility={columnVisibility}
                                            enablePagination={false}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
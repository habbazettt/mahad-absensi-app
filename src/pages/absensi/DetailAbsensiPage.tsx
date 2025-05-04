/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { CsvColumnConfig, Absensi, Pagination, Mentor, Mahasantri } from "@/types";
import { ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, Calendar, CheckCircle, ChevronDown, Moon, Plus, Sun, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PaginationComponent from "@/components/Pagination";
import DataTable from "@/components/DataTable";
import toast, { Toaster } from "react-hot-toast";
import { exportToCSV } from "@/utils/exportCsv";
import { CsvExportButton } from "@/components/CsvExportButton";
import AbsensiFilter from "@/components/filter/AbsensiFilter";
import MahasantriFilter from "@/components/filter/MahasantriFilter";
import MentorFilter from "@/components/filter/MentorFilter";
import { authCheck } from "@/lib/utils";
import { format, parse } from "date-fns";
import { id } from "date-fns/locale";
import ActionDropdown from "@/components/ActionDropdown";
import DeleteDialogComponent from "@/components/dialogs/DeleteDialog";

export default function DetailAbsensiPage() {
    const navigate = useNavigate();
    const [absensiData, setAbsensiData] = useState<Absensi[]>([]);
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mahasantriData, setMahasantriData] = useState<Mahasantri[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        total_data: 0,
        total_pages: 1,
    });
    const [columnVisibility, setColumnVisibility] = useState({});

    const [selectedWaktu, setSelectedWaktu] = useState<string | undefined>(undefined);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
    const [selectedMahasantriId, setSelectedMahasantriId] = useState<string | null>(null);
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

    const [openDialog, setOpenDialog] = useState(false)
    const [selectedId, setSelectedId] = useState(0)

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

    useEffect(() => {
        fetchAbsensiData(1);
    }, [selectedWaktu, selectedStatus, selectedMahasantriId, selectedMentorId]);

    const fetchAbsensiData = async (page: number) => {
        try {
            setLoading(true);
            const url = new URL(`${import.meta.env.VITE_API_URL}/absensi`);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            if (selectedStatus) {
                url.searchParams.append('status', selectedStatus);
            }
            if (selectedWaktu) {
                url.searchParams.append('waktu', selectedWaktu);
            }
            if (selectedMahasantriId) {
                url.searchParams.append('mahasantri_id', selectedMahasantriId.toString());
            }
            if (selectedMentorId) {
                url.searchParams.append('mentor_id', selectedMentorId.toString());
            }

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            if (!response.ok) throw new Error("Gagal mengambil data absensi");

            const data = await response.json();
            if (data.status) {
                setAbsensiData(data.data.absensi);
                setPagination({
                    current_page: data.data.pagination.current_page,
                    total_data: data.data.pagination.total_data,
                    total_pages: data.data.pagination.total_pages,
                });
            } else {
                console.error("Error fetching data:", data.message);
            }
        } catch (error) {
            setError("Gagal memuat data absensi");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

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
                setMahasantriData(data.data.mahasantri);
            }
        } catch (err) {
            setError("Gagal memuat data mahasantri");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.total_pages) return;
        fetchAbsensiData(newPage);
    };

    const columns = useMemo<ColumnDef<Absensi>[]>(() => [
        {
            id: "tanggal",
            accessorKey: "tanggal",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        Tanggal
                        {isSorted === "asc" ? (
                            <ArrowUpWideNarrow className="ml-2 h-4 w-4" />
                        ) : isSorted === "desc" ? (
                            <ArrowDownWideNarrow className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                );
            },
            cell: ({ row }) => {
                const dateStr = row.getValue("tanggal") as string
                const date = parse(dateStr, 'dd-MM-yyyy', new Date())

                const formattedDate = format(date, 'EEEE, dd MMM yyyy', { locale: id });

                return <span>{formattedDate}</span>
            },
        },
        {
            id: "mahasantri_id",
            accessorKey: "mahasantri_id",
            header: "Mahasantri",
            cell: ({ row }) => {
                const mahasantri = row.original.mahasantri;
                return <span className="font-medium">{mahasantri.nama}</span>;
            },
        },
        {
            id: "mentor_id",
            accessorKey: "mentor_id",
            header: "Mentor",
            cell: ({ row }) => {
                const mentor = row.original.mentor;
                return <span className="font-medium">{mentor.gender === 'L' ? `Ust. ${mentor.nama}` : `Usth. ${mentor.nama}`}</span>;
            },
        },
        {
            id: "waktu",
            accessorKey: "waktu",
            header: "Waktu",
            enableHiding: true,
            cell: ({ row }) => {
                const waktu = row.getValue("waktu");
                const isShubuh = waktu === "shubuh";

                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isShubuh ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}>
                        {isShubuh ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
                        {isShubuh ? 'Shubuh' : 'Isya'}
                    </span>
                );
            }
        },
        {
            id: "status",
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status: string = row.getValue("status");
                const isHadir = status === 'hadir';
                const isIzin = status === 'izin';

                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isHadir ? 'bg-green-200 text-green-800' : isIzin ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>
                        {isHadir ? <CheckCircle className="h-4 w-4 mr-1" /> : isIzin ? <Calendar className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                        {isHadir ? 'Hadir' : isIzin ? 'Izin' : 'Alpa'}
                    </span>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <ActionDropdown
                        row={row}
                        setOpenDialog={setOpenDialog}
                        setSelectedId={setSelectedId}
                        keyword="Absensi"
                        editPath="/dashboard/absensi/edit"
                    />
                );
            },
        },
    ], [navigate]);

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
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Filter by Mentor
    const handleMentorFilter = async (mentorId: string) => {
        setSelectedMentorId(mentorId === "all" ? null : parseInt(mentorId).toString());
        fetchAbsensiData(1);
    };

    // Filter by Mahasantri
    const handleMahasantriFilter = async (mahasantriId: string) => {
        setSelectedMahasantriId(mahasantriId === "all" ? null : parseInt(mahasantriId).toString());
        fetchAbsensiData(1);
    };

    // Filter by Waktu
    const handleWaktuFilter = async (waktu: string) => {
        setSelectedWaktu(waktu === "all" ? undefined : waktu);
        fetchAbsensiData(1);
    };

    // Filter by Status
    const handleStatusFilter = async (status: string) => {
        setSelectedStatus(status === "all" ? undefined : status);
        fetchAbsensiData(1);
    };

    // Export to CSV Handler
    const handleExportAllAbsensi = () => {
        const columns: CsvColumnConfig<Absensi>[] = [
            { key: 'tanggal', header: 'Tanggal' },
            { key: 'mahasantri_id', header: 'Mahasantri', format: (value) => absensiData.find(a => a.mahasantri.id === value)?.mahasantri.nama ?? '' },
            { key: 'mentor_id', header: 'Mentor', format: (value) => absensiData.find(a => a.mentor_id === value)?.mentor.nama ?? '' },
            { key: 'waktu', header: 'Waktu' },
            { key: 'status', header: 'Status' },
        ];

        exportToCSV(absensiData, columns, `Rekap Absensi`);
    };

    const handleDeleteAbsensi = async () => {
        const loadingToast = toast.loading("Sedang memproses...");
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi/${selectedId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed");
            }

            toast.dismiss(loadingToast);

            toast.success("Data Mahasantri berhasil dihapus!")

            setTimeout(() => {
                window.location.reload()
            }, 500)
        } catch (error) {
            console.error("error", error);
            toast.dismiss(loadingToast);
            toast.error("Mahasantri gagal dihapus!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        maxWidth: '500px',
                        padding: '12px 16px',
                    },
                    success: {
                        style: {
                            border: '1px solid #10B981',
                            backgroundColor: '#ECFDF5',
                            color: '#065F46',
                        },
                    },
                    error: {
                        style: {
                            border: '1px solid #EF4444',
                            backgroundColor: '#FEF2F2',
                            color: '#991B1B',
                        },
                    },
                }}
            />
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
                                        <BreadcrumbPage className="text-muted-foreground">Absensi Halaqoh</BreadcrumbPage>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-primary">Detail Absensi</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col mt-4 gap-4 p-4 pt-0">
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="p-6 pb-0">
                                    <h2 className="text-2xl font-bold">Daftar Absensi Mahasantri</h2>
                                    <p className="text-muted-foreground mt-2">
                                        Total {pagination.total_data} absensi terdaftar
                                    </p>
                                </div>
                                <div className="flex gap-2 p-6">
                                    <div className="">
                                        <Button
                                            type="button"
                                            onClick={() => navigate('/dashboard/absensi/add')}
                                            className="cursor-pointer"
                                        >
                                            <Plus />
                                            Input Absensi
                                        </Button>
                                    </div>
                                    <div>
                                        <CsvExportButton onClick={handleExportAllAbsensi} />
                                    </div>
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
                                                    selectedMahasantriId={selectedMahasantriId}
                                                    mahasantriData={mahasantriData}
                                                    handleMahasantriFilter={handleMahasantriFilter}
                                                />

                                                {/* Filter Waktu dan Status */}
                                                <AbsensiFilter
                                                    selectedWaktu={selectedWaktu}
                                                    handleWaktuFilter={handleWaktuFilter}
                                                    selectedStatus={selectedStatus}
                                                    handleStatusFilter={handleStatusFilter}
                                                />
                                            </div>

                                            {/* Columns Dropdown */}
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
                                                            .map((column) => {
                                                                const columnLabels: { [key: string]: string } = {
                                                                    mentor_id: "Mentor",
                                                                    mahasantri_id: "Mahasantri",
                                                                    tanggal: "Tanggal",
                                                                    waktu: "Waktu",
                                                                    status: "Status"
                                                                };

                                                                return (
                                                                    <DropdownMenuCheckboxItem
                                                                        key={column.id}
                                                                        className="capitalize"
                                                                        checked={column.getIsVisible()}
                                                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                                    >
                                                                        {columnLabels[column.id] ||
                                                                            column.id
                                                                                .replace(/_/g, ' ')
                                                                                .replace(/\bid\b/gi, '')
                                                                                .replace(/^\w/, (c) => c.toUpperCase())
                                                                        }
                                                                    </DropdownMenuCheckboxItem>
                                                                );
                                                            })}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <DataTable
                                            columns={columns}
                                            data={absensiData}
                                            sorting={sorting}
                                            onSortingChange={setSorting}
                                            columnVisibility={columnVisibility}
                                            enablePagination={true}
                                        />

                                        <PaginationComponent
                                            pagination={pagination}
                                            handlePageChange={handlePageChange}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Alert Dialog with Framer Motion */}
            <DeleteDialogComponent
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                handleDelete={handleDeleteAbsensi}
                keyword="Absensi"
            />
        </>
    );
}
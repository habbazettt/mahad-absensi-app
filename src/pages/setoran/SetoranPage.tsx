/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { CsvColumnConfig, Hafalan, Mahasantri, Mentor, Pagination } from "@/types"
import { ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, ChevronDown, Moon, Plus, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { processAllSetoranData } from "@/utils/dataProcessing"
import PaginationComponent from "@/components/Pagination"
import DataTable from "@/components/DataTable"
import toast, { Toaster } from "react-hot-toast"
import DeleteDialogComponent from "@/components/dialogs/DeleteDialog"
import ActionDropdown from "@/components/ActionDropdown"
import MentorFilter from "@/components/filter/MentorFilter"
import { authCheck, formatTanggalIndo } from "@/lib/utils"
import MahasantriFilter from "@/components/filter/MahasantriFilter"
import CategoryFilter from "@/components/filter/CategoryFilter"
import TimeFilter from "@/components/filter/TimeFilter"
import { exportToCSV } from "@/utils/exportCsv"
import { CsvExportButton } from "@/components/CsvExportButton"

export default function SetoranPage() {
    const navigate = useNavigate()
    const [hafalanData, setHafalanData] = useState<Hafalan[]>([])
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [mahasantriData, setMahasantriData] = useState<Mahasantri[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        total_data: 0,
        total_pages: 1,
    })
    const [openDialog, setOpenDialog] = useState(false)
    const [columnVisibility, setColumnVisibility] = useState({});

    const [selectedId, setSelectedId] = useState(0)
    const [selectedMentorId, setSelectedMentorId] = useState<string | undefined>(undefined);
    const [selectedMahasantriId, setSelectedMahasantriId] = useState<string | undefined>(undefined);

    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (authCheck()) {
                try {
                    setLoading(true)
                    // Fetch mentors first
                    const mentorsResponse = await fetch(
                        `${import.meta.env.VITE_API_URL}/mentors?page=1&limit=16`
                    )

                    if (!mentorsResponse.ok) throw new Error("Gagal mengambil data mentor")

                    const mentorsData = await mentorsResponse.json()

                    if (mentorsData.status) {
                        setMentors(mentorsData.data.mentors)
                    }

                    // Then fetch hafalan
                    await fetchHafalanData(1)

                    // Then fetch santri
                    await fetchMahasantriData(1, "")
                } catch (err) {
                    setError("Gagal memuat data awal")
                    console.error("Initial fetch error:", err)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchInitialData()
    }, [])

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.total_pages) return
        setPagination(prev => ({
            ...prev,
            current_page: newPage
        }))
        fetchHafalanData(newPage)
    }

    const fetchHafalanData = async (page: number, mentor_id?: number, mahasantri_id?: number, kategori?: string, waktu?: string) => {
        try {
            setLoading(true);
            const url = new URL(`${import.meta.env.VITE_API_URL}/hafalan`);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            url.searchParams.append('sort', sorting[0]?.desc ? 'desc' : 'asc');

            if (mentor_id) {
                url.searchParams.append('mentor_id', mentor_id.toString());
            }

            if (mahasantri_id) {
                url.searchParams.append('mahasantri_id', mahasantri_id.toString());
            }

            if (kategori) {
                url.searchParams.append('kategori', kategori);
            }

            if (waktu) {
                url.searchParams.append('waktu', waktu);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            if (!response.ok) throw new Error("Gagal mengambil data hafalan");

            const data = await response.json();

            if (data.status) {
                const processedHafalanData = processAllSetoranData(data.data.hafalan);
                setHafalanData(processedHafalanData);
                setPagination({
                    current_page: data.data.pagination.current_page,
                    total_data: data.data.pagination.total_data,
                    total_pages: data.data.pagination.total_pages,
                });
            } else {
                console.error("Error fetching data:", data.message);
            }
        } catch (error) {
            setError("Gagal memuat data hafalan");
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
            url.searchParams.append('limit', '10');
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

    const getMentorName = (mentorId: number) => {
        const mentor = mentors.find(m => m.id === mentorId);
        return mentor ? mentor.nama : 'Belum ada mentor';
    };

    const getMentorGender = (mentorId: number) => {
        const mentor = mentors.find(m => m.id === mentorId);
        return mentor?.gender === "L" ? "Ust. " : "Ust. ";
    };

    const getMahasantriName = (mahasantriId: number) => {
        const mahasantri = mahasantriData.find(m => m.id === mahasantriId);
        return mahasantri ? mahasantri.nama : 'Belum ada mahasantri';
    };

    // Definisi Kolom Tabel
    const columns = useMemo<ColumnDef<Hafalan>[]>(() => [
        {
            id: "created_at",
            accessorKey: "created_at",
            enableSorting: true,
            enableHiding: true,
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        Hari, Tanggal
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
            sortingFn: (rowA, rowB) => {
                const dateA = rowA.original.original_created_at;
                const dateB = rowB.original.original_created_at;

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                return dateA.getTime() - dateB.getTime();
            },
        },
        {
            id: "mahasantri_id",
            accessorKey: "mahasantri_id",
            header: "Mahasantri",
            enableHiding: true,
            cell: ({ row }) => {
                const mahasantri_id = row.getValue("mahasantri_id") as number;
                return (
                    <span className="font-medium">
                        {getMahasantriName(mahasantri_id)}
                    </span>
                );
            },
        },
        {
            id: "mentor_id",
            accessorKey: "mentor_id",
            header: "Mentor",
            enableHiding: true,
            cell: ({ row }) => {
                const mentorId = row.getValue("mentor_id") as number;
                return (
                    <span className="font-medium">
                        {getMentorGender(mentorId)}
                        {getMentorName(mentorId)}
                    </span>
                );
            },
        },
        {
            id: "juz",
            accessorKey: "juz",
            header: "Juz",
            enableHiding: true,
        },
        {
            id: "halaman",
            accessorKey: "halaman",
            header: "Halaman",
            enableHiding: true,
        },
        {
            id: "total_setoran",
            accessorKey: "total_setoran",
            header: "Total Setoran",
            enableHiding: true,
            cell: ({ row }) => (
                <h1>
                    {row.getValue("total_setoran")} halaman
                </h1>
            )
        },
        {
            id: "kategori",
            accessorKey: "kategori",
            header: "Kategori",
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.getValue("kategori") === 'ziyadah' ? 'bg-blue-500/20' : 'bg-pink-600/20'} text-primary`}>
                    {row.getValue("kategori")}
                </span>
            ),
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
            id: "catatan",
            accessorKey: "catatan",
            header: "Catatan",
            enableHiding: true,
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
                        keyword="Setoran"
                        editPath="/dashboard/setoran/edit"
                    />
                );
            },
        },
    ], [mentors, mahasantriData, hafalanData]);

    const table = useReactTable({
        data: hafalanData,
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

    const handleDeleteSetoran = async () => {
        const loadingToast = toast.loading("Sedang memproses...");
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hafalan/${selectedId}`, {
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

    // Filter by Mentor
    const handleMentorFilter = async (mentorId: string) => {
        setSelectedMentorId(mentorId === "all" ? undefined : mentorId);
        if (mentorId === "all") {
            await fetchHafalanData(1);
        } else {
            await fetchHafalanData(1, parseInt(mentorId));
        }
    };

    // Filter by Mahasantri
    const handleMahasantriFilter = async (mahasantriId: string) => {
        if (mahasantriId === "all") {
            setSelectedMahasantriId(undefined);
            setSelectedMentorId(undefined);
            await fetchHafalanData(1);
        } else {
            setSelectedMahasantriId(mahasantriId);
            await fetchHafalanData(1, undefined, parseInt(mahasantriId));
        }
    };

    // Filter by Category
    const handleCategoryFilter = async (category: string) => {
        const selectedCat = category === "all" ? undefined : category;
        setSelectedCategory(selectedCat);
        await fetchHafalanData(1, undefined, Number(selectedMahasantriId), selectedCat, selectedTime);
    };

    // Filter by Time
    const handleTimeFilter = async (time: string) => {
        const selectedTm = time === "all" ? undefined : time;
        setSelectedTime(selectedTm);
        await fetchHafalanData(1, undefined, Number(selectedMahasantriId), selectedCategory, selectedTm);
    };

    const filteredMahasantriData = useMemo(() => {
        if (!selectedMentorId) return mahasantriData;
        return mahasantriData.filter(mahasantri => mahasantri.mentor_id === parseInt(selectedMentorId));
    }, [mahasantriData, selectedMentorId]);

    // Export to CSV Handler
    const handleExportAllHafalan = () => {
        const columns: CsvColumnConfig<Hafalan>[] = [
            {
                key: 'created_at',
                header: 'Hari, Tanggal',
                format: (value) => formatTanggalIndo(value)
            },
            {
                key: "mahasantri_id",
                header: "Mahasantri",
                format: (value) => {
                    const mahasantri = filteredMahasantriData.find(mahasantri => mahasantri.id === value);
                    return mahasantri ? mahasantri.nama : '';
                }
            },
            {
                key: "mentor_id",
                header: "Mentor",
                format: (value) => {
                    const mentor = mentors.find(mentor => mentor.id === value);
                    return mentor ? mentor.nama : '';
                }
            },
            { key: 'juz', header: 'Juz' },
            { key: 'halaman', header: 'Halaman' },
            { key: 'total_setoran', header: 'Total Setoran' },
            { key: 'kategori', header: 'Kategori' },
            { key: 'waktu', header: 'Waktu' },
            { key: 'catatan', header: 'Catatan' },
        ];

        exportToCSV(
            hafalanData,
            columns,
            `Rekap Hafalan`
        );
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
                                        <BreadcrumbPage className="text-primary">Setoran Mahasantri</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col mt-4 gap-4 p-4 pt-0">
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="p-6 pb-0">
                                    <h2 className="text-2xl font-bold">Daftar Setoran Hafalan Mahasantri</h2>
                                    <p className="text-muted-foreground mt-2">
                                        Total {pagination.total_data} hafalan terdaftar
                                    </p>
                                </div>
                                <div className="flex gap-2 p-6">
                                    <div className="">
                                        <Button
                                            type="button"
                                            onClick={() => navigate('/dashboard/setoran/add')}
                                            className="cursor-pointer"
                                        >
                                            <Plus />
                                            Input Setoran
                                        </Button>
                                    </div>
                                    <div>
                                        <CsvExportButton onClick={handleExportAllHafalan} />
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
                                                <MentorFilter selectedMentorId={selectedMentorId} mentors={mentors} handleMentorFilter={handleMentorFilter} />

                                                <MahasantriFilter
                                                    mahasantriData={filteredMahasantriData}
                                                    handleMahasantriFilter={handleMahasantriFilter}
                                                    selectedMahasantriId={selectedMahasantriId}
                                                />

                                                <CategoryFilter
                                                    selectedCategory={selectedCategory}
                                                    handleCategoryFilter={handleCategoryFilter}
                                                />
                                                <TimeFilter
                                                    selectedTime={selectedTime}
                                                    handleTimeFilter={handleTimeFilter}
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
                                                                    created_at: "Hari, Tanggal"
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
                                            data={hafalanData}
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
                handleDelete={handleDeleteSetoran}
                keyword="Setoran"
            />
        </>
    )
}

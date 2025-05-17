/* eslint-disable react-hooks/exhaustive-deps */
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
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { handleLogout, isTokenExpired } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Column, Hafalan, Mahasantri, Mentor, Pagination, TargetSemester } from "@/types";
import ToasterLayout from "@/components/ToasterLayout";
import CategoryFilter from "@/components/filter/CategoryFilter";
import TimeFilter from "@/components/filter/TimeFilter";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, ChevronDown, Moon, Sun } from "lucide-react";
import PaginationComponent from "@/components/Pagination";
import DataTable from "@/components/DataTable";
import { ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import TahunAjaranFilter from "@/components/filter/TahunAjaranFilter";
import SemesterFilter from "@/components/filter/SemesterFilter";
import { processAllSetoranData } from "@/utils/dataProcessing";

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
    const [hafalanData, setHafalanData] = useState<Hafalan[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        total_data: 0,
        total_pages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const [targetSemesterSorting, setTargetSemesterSorting] = useState<SortingState>([]);
    const [targetSemesterColumnVisibility, setTargetSemesterColumnVisibility] = useState({});

    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | undefined>(undefined);
    const [selectedSemester, setSelectedSemester] = useState<string | undefined>(undefined);

    const [targetSemesterData, setTargetSemesterData] = useState<TargetSemester[]>([]);

    useEffect(() => {
        const fetchInitialHafalanTargetData = async () => {
            try {
                setIsLoading(true);
                if (user.id <= 0) {
                    setError("ID pengguna tidak valid.");
                    return;
                }
                await fetchHafalanData(1);
                await fetchTargetSemesterData();
            } catch (err) {
                setError("Gagal memuat data awal");
                console.error("Initial fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchInitialHafalanTargetData();
    }, [sorting, user.id]);


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

    const fetchHafalanData = async (page: number, selectedCategory?: string, selectedTime?: string) => {
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/hafalan/mahasantri/${user.id}`);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            url.searchParams.append('sort', sorting[0]?.desc ? 'desc' : 'asc');
            if (selectedCategory) {
                url.searchParams.append('kategori', selectedCategory);
            }
            if (selectedTime) {
                url.searchParams.append('waktu', selectedTime);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
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
            }
        } catch (err) {
            setError("Gagal memuat data hafalan");
            console.error("Fetch error:", err);
        }
    };

    const fetchTargetSemesterData = async (selectedTahunAjaran?: string, selectedSemester?: string) => {
        if (user.id <= 0) {
            setError("ID pengguna tidak valid.");
            return;
        }
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/target_semester/mahasantri/${user.id}`);
            if (selectedTahunAjaran) {
                url.searchParams.append('tahun_ajaran', selectedTahunAjaran);
            }

            if (selectedSemester) {
                url.searchParams.append('semester', selectedSemester);
            }
            const response = await fetch(url.toString(), {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            if (!response.ok) throw new Error("Gagal mengambil data target semester");
            const data = await response.json();
            if (data.status) {
                setTargetSemesterData(data.data.target_semester);
            }
        } catch (err) {
            setError("Gagal memuat data target semester");
            console.error("Fetch error:", err);
        }
    };


    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.total_pages) return;
        setPagination(prev => ({
            ...prev,
            current_page: newPage,
        }));
        fetchHafalanData(newPage);
    };

    const handleCategoryFilter = async (category: string) => {
        const selectedCat = category === "all" ? undefined : category;
        setSelectedCategory(selectedCat);
        await fetchHafalanData(1, selectedCat, selectedTime);
    };

    const handleTimeFilter = async (time: string) => {
        const selectedTm = time === "all" ? undefined : time;
        setSelectedTime(selectedTm);
        await fetchHafalanData(1, selectedCategory, selectedTm);
    };

    const handleTahunAjaranFilter = async (tahunAjaran: string) => {
        const selectedTahunAjar = tahunAjaran === "all" ? undefined : tahunAjaran;
        setSelectedTahunAjaran(selectedTahunAjar);
        await fetchTargetSemesterData(selectedTahunAjar);
    }

    const handleSemesterFilter = async (semester: string) => {
        const selectedSemester = semester === "all" ? undefined : semester;
        setSelectedSemester(selectedSemester);
        await fetchTargetSemesterData(selectedTahunAjaran, selectedSemester);
    }

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
                const dateA = new Date(rowA.original.created_at);
                const dateB = new Date(rowB.original.created_at);
                return dateA.getTime() - dateB.getTime();
            },
        },
        {
            id: "juz",
            accessorKey: "juz",
            header: "Juz",
        },
        {
            id: "halaman",
            accessorKey: "halaman",
            header: "Halaman",
        },
        {
            id: "total_setoran",
            accessorKey: "total_setoran",
            header: "Total Setoran",
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
        },
    ], [hafalanData]);

    const targetSemesterColumns = useMemo<ColumnDef<TargetSemester>[]>(() => [
        {
            id: "tahun_ajaran",
            accessorKey: "tahun_ajaran",
            header: "Tahun Ajaran",
        },
        {
            id: "semester",
            accessorKey: "semester",
            header: "Semester",
        },
        {
            id: "target",
            accessorKey: "target",
            header: "Target",
        },
        {
            id: "keterangan",
            accessorKey: "keterangan",
            header: "Keterangan",
        },
    ], []);

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

    const targetSemesterTable = useReactTable({
        data: targetSemesterData,
        columns: targetSemesterColumns,
        state: {
            sorting: targetSemesterSorting,
            columnVisibility: targetSemesterColumnVisibility,
        },
        onSortingChange: setTargetSemesterSorting,
        onColumnVisibilityChange: setTargetSemesterColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

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

                                {/* Setoran Hafalan */}
                                <div className="rounded-lg border bg-card shadow-sm p-6">
                                    <h2 className="text-2xl font-bold">Setoran Hafalan</h2>
                                    {error ? (
                                        <div className="text-red-500 text-center py-8">{error}</div>
                                    ) : isLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-full flex flex-wrap gap-4 py-4 justify-between items-start lg:items-center sm:gap-4">
                                                <div className="flex flex-wrap gap-4">
                                                    <CategoryFilter
                                                        selectedCategory={selectedCategory}
                                                        handleCategoryFilter={handleCategoryFilter}
                                                    />

                                                    <TimeFilter
                                                        selectedTime={selectedTime}
                                                        handleTimeFilter={handleTimeFilter}
                                                    />
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
                                            </div>

                                            <DataTable
                                                columns={columns as Column[]}
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

                                {/* Target Semester */}
                                <div className="rounded-lg border bg-card shadow-sm p-6">
                                    <h2 className="text-2xl font-bold">Target Semester</h2>
                                    {error ? (
                                        <div className="text-red-500 text-center py-8">{error}</div>
                                    ) : isLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-full flex flex-wrap gap-4 py-4 justify-between items-start lg:items-center sm:gap-4">
                                                <div className="flex flex-wrap gap-4">
                                                    <TahunAjaranFilter
                                                        selectedTahunAjaran={selectedTahunAjaran}
                                                        handleTahunAjaranFilter={handleTahunAjaranFilter}
                                                    />

                                                    <SemesterFilter
                                                        selectedSemester={selectedSemester}
                                                        handleSemesterFilter={handleSemesterFilter}
                                                    />
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
                                                                {targetSemesterTable
                                                                    .getAllColumns()
                                                                    .filter((column) => column.getCanHide())
                                                                    .map((column) => {
                                                                        const columnLabels: { [key: string]: string } = {
                                                                            semester: "Semester",
                                                                            tahun_ajaran: "Tahun Ajaran",
                                                                            target: "Target",
                                                                            keterangan: "Keterangan",
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
                                            </div>

                                            {targetSemesterData.length > 0 ? (
                                                <DataTable
                                                    columns={targetSemesterColumns}
                                                    data={targetSemesterData}
                                                    sorting={targetSemesterSorting}
                                                    onSortingChange={setTargetSemesterSorting}
                                                    columnVisibility={targetSemesterColumnVisibility}
                                                    enablePagination={true}
                                                />
                                            ) : (
                                                <div className="text-center text-muted-foreground py-4">Tidak ada data target semester.</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
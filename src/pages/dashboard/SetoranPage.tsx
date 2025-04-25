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
import { Hafalan, HafalanPagination, Mahasantri, Mentor } from "@/types"
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, ChevronDown, Edit, Moon, MoreHorizontal, Sun, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { processAllSetoranData } from "@/utils/dataProcessing"

export default function SetoranPage() {
    const navigate = useNavigate()
    const [hafalanData, setHafalanData] = useState<Hafalan[]>([])
    const [filteredHafalanData, setFilteredHafalanData] = useState<Hafalan[]>([])
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [mahasantriData, setMahasantriData] = useState<Mahasantri[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<HafalanPagination>({
        current_page: 1,
        total_hafalan: 0,
        total_pages: 1,
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 600)

        return () => {
            clearTimeout(handler)
        }
    }, [searchTerm])

    useEffect(() => {
        const authCheck = () => {
            const user = localStorage.getItem("user")
            if (!user) {
                navigate("/")
                return false
            }

            try {
                const userData = JSON.parse(user)
                if (userData.user_type !== "mentor") navigate("/")
                return true
            } catch (error) {
                console.error("Failed to parse user data:", error)
                navigate("/")
                return false
            }
        }


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

    // Handle search and pagination
    useEffect(() => {
        if (debouncedSearchTerm !== "") {
            setPagination(prev => ({ ...prev, current_page: 1 }))
            fetchMahasantriData(1, debouncedSearchTerm)
        } else {
            fetchMahasantriData(pagination.current_page, "")
            setFilteredHafalanData(hafalanData)
        }
    }, [debouncedSearchTerm, hafalanData])

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.total_pages) return
        setPagination(prev => ({
            ...prev,
            current_page: newPage
        }))
        fetchHafalanData(newPage)
    }

    const fetchHafalanData = async (page: number) => {
        try {
            setLoading(true);
            const url = new URL(`${import.meta.env.VITE_API_URL}/hafalan`);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            if (!response.ok) throw new Error("Gagal mengambil data hafalan");

            const data = await response.json();

            if (data.status) {
                // Proses data hafalan sebelum menyetelnya ke state
                const processedHafalanData = processAllSetoranData(data.data.hafalan);

                setHafalanData(processedHafalanData);
                setFilteredHafalanData(processedHafalanData);
                setPagination({
                    current_page: data.data.pagination.current_page,
                    total_hafalan: data.data.pagination.total_hafalan,
                    total_pages: data.data.pagination.total_pages,
                });
            }
        } catch (error) {
            setError("Gagal memuat data hafalan");
            console.error("Initial fetch error:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleMentorFilter = (mentorId: string) => {
        if (mentorId === "all") {
            setFilteredHafalanData(hafalanData);
        } else {
            const filteredData = hafalanData.filter(hafalan => hafalan.mentor_id.toString() === mentorId);
            setFilteredHafalanData(filteredData);
        }
    };

    const handleWaktuFilter = (waktu: string) => {
        if (waktu === "all") {
            setFilteredHafalanData(hafalanData)
        } else {
            const filteredData = hafalanData.filter(hafalan => hafalan.waktu === waktu)
            setFilteredHafalanData(filteredData)
        }
    }

    const handleKategoriFilter = (kategori: string) => {
        if (kategori === "all") {
            setFilteredHafalanData(hafalanData)
        } else {
            const filteredData = hafalanData.filter(hafalan => hafalan.kategori === kategori)
            setFilteredHafalanData(filteredData)
        }
    }

    const fetchMahasantriData = async (page: number, search: string) => {
        try {
            setLoading(true)
            const url = new URL(`${import.meta.env.VITE_API_URL}/mahasantri`)
            url.searchParams.append('page', page.toString())
            url.searchParams.append('limit', '10')
            if (search) {
                url.searchParams.append('nama', search)
            }
            const response = await fetch(url.toString())
            if (!response.ok) throw new Error("Gagal mengambil data mahasantri")
            const data = await response.json()
            if (data.status) {
                setMahasantriData(data.data.mahasantri);

                // Jika tidak ada pencarian, set filteredHafalanData ke hafalanData
                if (search === "") {
                    setFilteredHafalanData(hafalanData);
                } else {
                    // Filter hafalanData berdasarkan nama mahasantri
                    const filteredHafalan = hafalanData.filter(hafalan => {
                        const mahasantri = data.data.mahasantri.find((m: Mahasantri) => m.id === hafalan.mahasantri_id);
                        return mahasantri && mahasantri.nama.toLowerCase().includes(search.toLowerCase());
                    });
                    setFilteredHafalanData(filteredHafalan);
                }
            }
        } catch (err) {
            setError("Gagal memuat data mahasantri")
            console.error("Fetch error:", err)
        } finally {
            setLoading(false)
        }
    }

    const getMentorName = (mentorId: number) => {
        const mentor = mentors.find(m => m.id === mentorId)
        return mentor ? mentor.nama : 'Belum ada mentor'
    }

    const getMentorGender = (mentorId: number) => {
        const mentor = mentors.find(m => m.id === mentorId)
        return mentor?.gender === "L" ? "Ust. " : "Ust. "
    }

    const getMahasantriName = (mahasantriId: number) => {
        const mahasantri = mahasantriData.find(m => m.id === mahasantriId)
        return mahasantri ? mahasantri.nama : 'Belum ada mahasantri'
    }

    // Definisi Kolom Tabel
    const columns = useMemo<ColumnDef<Hafalan>[]>(() => [
        {
            id: "created_at",
            accessorKey: "created_at",
            enableSorting: true,
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
        {
            id: "actions",
            enableHiding: false,
            cell: () => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {

                                }}
                            >
                                <Edit className="text-blue-400" />
                                Edit Setoran
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    // setOpenDialog(true)
                                    // setSelectedId(row.original.id)
                                }}
                            >
                                <Trash className="text-red-400" />
                                Hapus Setoran
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [mentors, mahasantriData, filteredHafalanData]);

    const table = useReactTable({
        data: filteredHafalanData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

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
                        <div className="p-6 pb-0">
                            <h2 className="text-2xl font-bold">Daftar Setoran Hafalan Mahasantri</h2>
                            <p className="text-muted-foreground mt-2">
                                Total {pagination.total_hafalan} hafalan terdaftar
                            </p>
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
                                    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-4">
                                        {/* Filter by Mentor */}
                                        <div className="w-full sm:w-[280px]">
                                            <Select onValueChange={(e) => handleMentorFilter(e)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Filter Mentor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Mentor</SelectItem>
                                                    {mentors.map((mentor) => (
                                                        <SelectItem
                                                            key={mentor.id}
                                                            value={String(mentor.id)}
                                                        >
                                                            {mentor.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Filter by Kategori */}
                                        <div className="w-full sm:w-[280px]">
                                            <Select onValueChange={(e) => handleKategoriFilter(e)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Filter Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                                    <SelectItem value="ziyadah">Ziyadah</SelectItem>
                                                    <SelectItem value="murojaah">Muroja'ah</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Filter by Waktu */}
                                        <div className="w-full sm:w-[280px]">
                                            <Select onValueChange={(e) => handleWaktuFilter(e)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Filter Waktu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Waktu</SelectItem>
                                                    <SelectItem value="shubuh">Shubuh</SelectItem>
                                                    <SelectItem value="isya">Isya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Search Input */}
                                        <div className="flex items-center flex-1 relative">
                                            <Input
                                                placeholder="Cari nama mahasantri..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pr-10"
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

                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id}>
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                        className="hover:bg-accent/50"
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        Tidak ada data
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Halaman {pagination.current_page} dari {pagination.total_pages}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                                disabled={pagination.current_page === 1}
                                            >
                                                Sebelumnya
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                                disabled={pagination.current_page === pagination.total_pages}
                                            >
                                                Selanjutnya
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

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
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Mahasantri, MahasantriPagination, Mentor } from "@/types"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, ChevronDown, Edit, MoreHorizontal, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MahasantriInfoPage() {
    const navigate = useNavigate()
    const [mahasantriData, setMahasantriData] = useState<Mahasantri[]>([])
    const [filteredMahasantriData, setFilteredMahasantriData] = useState<Mahasantri[]>([])
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [pagination, setPagination] = useState<MahasantriPagination>({
        current_page: 1,
        total_mahasantri: 0,
        total_pages: 1,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [sorting, setSorting] = useState<SortingState>([])

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

                    // Then fetch mahasantri
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
        }
    }, [debouncedSearchTerm])

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.total_pages) return
        setPagination(prev => ({
            ...prev,
            current_page: newPage
        }))
        fetchMahasantriData(newPage, debouncedSearchTerm)
    }

    const handleMentorFilter = (mentorId: string) => {
        if (mentorId === "all") {
            setFilteredMahasantriData(mahasantriData);
        } else {
            const filteredData = mahasantriData.filter(mahasantri => mahasantri.mentor_id.toString() === mentorId);
            setFilteredMahasantriData(filteredData);
        }
    };

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
                setMahasantriData(data.data.mahasantri)
                setFilteredMahasantriData(data.data.mahasantri);
                setPagination({
                    current_page: data.data.pagination.current_page,
                    total_mahasantri: data.data.pagination.total_mahasantri,
                    total_pages: data.data.pagination.total_pages
                })
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

    // Definisi Kolom Tabel
    const columns = useMemo<ColumnDef<Mahasantri>[]>(() => [
        {
            id: "nama",
            accessorKey: "nama",
            enableSorting: true,
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        Nama
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
        },
        {
            id: "mentor_id",
            accessorKey: "mentor_id",
            header: "Mentor",
            cell: ({ row }) => {
                const mentorId = row.getValue("mentor_id") as number;
                return (
                    <span className="font-medium">
                        {row.getValue("gender") === 'L' ? `Ust. ${getMentorName(mentorId)}` : `Usth. ${getMentorName(mentorId)}`}
                    </span>
                );
            },
        },
        {
            id: "nim",
            accessorKey: "nim",
            header: "NIM",
        },
        {
            id: "jurusan",
            accessorKey: "jurusan",
            header: "Jurusan",
        },
        {
            id: "gender",
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.getValue("gender") === 'L' ? 'bg-blue-500/20' : 'bg-pink-600/20'} text-primary`}>
                    {row.getValue("gender") === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
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
                                    navigate(`/dashboard/info-mahasantri/edit/${row.original.id}`)
                                }}
                            >
                                <Edit className="text-blue-400" />
                                Edit Mahasantri
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Trash className="text-red-400" />
                                Hapus Mahasantri
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [mentors]);

    const table = useReactTable({
        data: filteredMahasantriData,
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
                                    <BreadcrumbPage className="text-primary">Data Mahasantri</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col mt-4 gap-4 p-4 pt-0">
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="p-6 pb-0">
                            <h2 className="text-2xl font-bold">Daftar Mahasantri</h2>
                            <p className="text-muted-foreground mt-2">
                                Total {pagination.total_mahasantri} mahasantri terdaftar
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
                                                                nama: "Nama",
                                                                nim: "NIM",
                                                                jurusan: "Jurusan",
                                                                gender: "Gender"
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
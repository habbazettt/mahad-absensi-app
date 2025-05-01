import { useEffect, useMemo, useState } from "react"
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
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"
import { CsvColumnConfig, Mentor, Pagination } from "@/types"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, ChevronDown } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import PaginationComponent from "@/components/Pagination"
import DataTable from "@/components/DataTable"
import DeleteDialogComponent from "@/components/dialogs/DeleteDialog"
import ActionDropdown from "@/components/ActionDropdown"
import { authCheck } from "@/lib/utils"
import { exportToCSV } from "@/utils/exportCsv"
import { CsvExportButton } from "@/components/CsvExportButton"

export default function MentorInfoPage() {
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        total_data: 0,
        total_pages: 1,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedId, setSelectedId] = useState(0)
    const [columnVisibility, setColumnVisibility] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            if (authCheck()) {
                try {
                    setLoading(true)

                    // Fetch mentors
                    const mentorsResponse = await fetch(
                        `${import.meta.env.VITE_API_URL}/mentors?page=1&limit=16`
                    )

                    if (!mentorsResponse.ok) throw new Error("Gagal mengambil data mentor")

                    const mentorsData = await mentorsResponse.json()

                    if (mentorsData.status) {
                        setMentors(mentorsData.data.mentors);
                        setPagination({
                            current_page: mentorsData.data.pagination.current_page,
                            total_data: mentorsData.data.pagination.total_mentors,
                            total_pages: mentorsData.data.pagination.total_pages,
                        });
                    }
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
    }

    // Definisi Kolom Tabel
    const columns = useMemo<ColumnDef<Mentor>[]>(() => [
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
            id: "email",
            accessorKey: "email",
            header: "Email",
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
            id: "mahasantri_count",
            accessorKey: "mahasantri_count",
            header: "Jumlah Mahasantri",
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
                        keyword="Mentor"
                        editPath="/dashboard/mentor/edit"
                    />
                );
            },
        },
    ], []);

    const table = useReactTable({
        data: mentors,
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

    const handleDeleteMentor = async () => {
        const loadingToast = toast.loading("Sedang memproses...");
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mentors/${selectedId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed");
            }

            toast.dismiss(loadingToast);
            toast.success("Data Mentor berhasil dihapus!");

            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error("error", error);
            toast.dismiss(loadingToast);
            toast.error("Mentor gagal dihapus!");
        } finally {
            setLoading(false);
        }
    };

    // Export to CSV Handler
    const handleExportAllMentors = () => {
        const columns: CsvColumnConfig<Mentor>[] = [
            { key: "nama", header: "Nama Mentor" },
            { key: "email", header: "Email" },
            { key: "gender", header: "Gender" },
            { key: "mahasantri_count", header: "Jumlah Mahasantri" },
        ];

        exportToCSV(
            mentors,
            columns,
            `Rekap Data Mentor`
        );
    };

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
                                        <BreadcrumbPage className="text-primary">Data Mentor</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col mt-4 gap-4 p-4 pt-0">
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="p-6 pb-0">
                                    <h2 className="text-2xl font-bold">Daftar Mentor</h2>
                                    <p className="text-muted-foreground mt-2">
                                        Total {pagination.total_data} mentor terdaftar
                                    </p>
                                </div>
                                <div className="p-6 pb-0">
                                    <CsvExportButton onClick={handleExportAllMentors} />
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
                                        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-4">
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
                                                                    email: "Email",
                                                                    gender: "Gender",
                                                                    mahasantri_count: "Jumlah Mahasantri"
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
                                            data={mentors}
                                            sorting={sorting}
                                            onSortingChange={setSorting}
                                            columnVisibility={columnVisibility}
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
                handleDelete={handleDeleteMentor}
                keyword="Mentor"
            />
        </>
    )
}
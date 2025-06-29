import { useEffect, useMemo, useState } from "react";
import { RekapMingguan } from "@/types";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, CheckCircle2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function untuk menentukan warna progress bar berdasarkan persentase
const getProgressColor = (percentage: number): string => {
    if (percentage >= 99.9) return "bg-green-500";
    if (percentage > 70) return "bg-blue-500";
    if (percentage > 30) return "bg-yellow-500";
    if (percentage > 0) return "bg-orange-400";
    return "bg-gray-300";
};

// --- Komponen untuk Tampilan Mobile ---
const MobileCardList = ({ data }: { data: RekapMingguan[] }) => {
    return (
        <div className="space-y-4 p-4 pt-0">
            {data.map((item) => {
                const percentage = item.persentase_pencapaian;
                const progressColor = getProgressColor(percentage);

                return (
                    <div key={item.mahasantri_id} className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        {/* Card Header */}
                        <div className="p-4 space-y-2">
                            <h3 className="font-semibold text-base tracking-tight">{item.nama_mahasantri}</h3>
                            <div className="flex items-center gap-3" title={`${percentage.toFixed(1)}%`}>
                                <Progress value={percentage} className="h-3 flex-1" indicatorClassName={progressColor} />
                                <span className="font-bold text-sm text-primary w-12 text-right">
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                        {/* Card Body */}
                        <div className="p-4 pt-0 border-t grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="h-4 w-4" />
                                <div>
                                    <p className="text-xs">Target</p>
                                    <p className="font-semibold text-card-foreground">{item.total_target_halaman_mingguan} Hal</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <div>
                                    <p className="text-xs">Selesai</p>
                                    <p className="font-semibold text-card-foreground">{item.total_selesai_halaman_mingguan} Hal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- Komponen untuk Tampilan Desktop ---
const DesktopTable = ({ data }: { data: RekapMingguan[] }) => {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<RekapMingguan>[]>(() => [
        {
            accessorKey: "nama_mahasantri",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Nama Mahasantri
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("nama_mahasantri")}</div>
        },
        {
            accessorKey: "total_target_halaman_mingguan",
            header: () => <div className="text-right">Target (Hal)</div>,
            cell: ({ row }) => <div className="text-right font-mono">{row.getValue("total_target_halaman_mingguan")}</div>,
        },
        {
            accessorKey: "total_selesai_halaman_mingguan",
            header: () => <div className="text-right">Selesai (Hal)</div>,
            cell: ({ row }) => <div className="text-right font-mono">{row.getValue("total_selesai_halaman_mingguan")}</div>,
        },
        {
            accessorKey: "persentase_pencapaian",
            header: "Pencapaian Mingguan",
            cell: ({ row }) => {
                const percentage = parseFloat(row.getValue("persentase_pencapaian"));
                const progressColor = getProgressColor(percentage);
                return (
                    <div className="flex items-center gap-3" title={`${percentage.toFixed(1)}%`}>
                        <Progress value={percentage} className="w-full md:w-2/3 h-3" indicatorClassName={progressColor} />
                        <span className="font-semibold text-sm text-muted-foreground w-12 text-right">
                            {percentage.toFixed(0)}%
                        </span>
                    </div>
                );
            }
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="border-t">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Tidak ada data untuk ditampilkan.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

// --- Komponen Utama yang Menggabungkan Keduanya ---
export default function TabelRekapMingguan() {
    const [rekapData, setRekapData] = useState<RekapMingguan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRekap = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor/rekap-bimbingan/mingguan`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` },
                });
                const responseData = await response.json();
                if (!response.ok || !responseData.status) {
                    throw new Error(responseData.message || "Gagal mengambil data rekapitulasi.");
                }
                setRekapData(responseData.data || []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
                setError(errorMessage);
                console.error("Gagal mengambil rekap mingguan:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRekap();
    }, []);

    if (loading) {
        return (
            <div className="rounded-lg border bg-card shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-lg">Memuat Rekapitulasi Mingguan...</h3>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 w-full bg-muted/50 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="rounded-lg border bg-destructive/10 text-destructive p-6 text-center">{error}</div>
    }

    return (
        <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
                <h3 className="font-semibold text-lg">Rekapitulasi Mingguan</h3>
                <p className="text-sm text-muted-foreground">Performa murojaah mahasantri dalam sepekan terakhir.</p>
            </div>

            {rekapData.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 border-t">
                    Tidak ada data rekapitulasi untuk ditampilkan.
                </div>
            ) : (
                <>
                    {/* Tampilkan Tabel untuk Desktop */}
                    <div className="hidden md:block">
                        <DesktopTable data={rekapData} />
                    </div>

                    {/* Tampilkan Daftar Kartu untuk Mobile */}
                    <div className="block md:hidden">
                        <MobileCardList data={rekapData} />
                    </div>
                </>
            )}
        </div>
    )
}

import { formatTanggalIndo } from "@/lib/utils"
import { Hafalan } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export const setoranColumns: ColumnDef<Hafalan>[] = [
    {
        accessorKey: "created_at",
        header: "Tanggal Setor",
        cell: ({ row }) => formatTanggalIndo(row.getValue("created_at")),
    },
    {
        accessorKey: "waktu",
        header: "Waktu",
    },
    {
        accessorKey: "nama",
        header: "Nama",
    },
    {
        accessorKey: "juz",
        header: "Juz",
    },
    {
        accessorKey: "halaman",
        header: "Halaman",
    },
    {
        accessorKey: "total_setoran",
        header: "Total Setoran",
    },
    {
        accessorKey: "kategori",
        header: "Kategori",
    },
    {
        accessorKey: "catatan",
        header: "Catatan",
    },
]

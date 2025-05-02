import { Absensi } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const absensiColumns: ColumnDef<Absensi>[] = [
    {
        accessorKey: "mahasantri.nama",
        header: "Mahasantri",
    },
    {
        accessorKey: "tanggal",
        header: "Tanggal",
    },
    {
        accessorKey: "waktu",
        header: "Waktu",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
] as const;
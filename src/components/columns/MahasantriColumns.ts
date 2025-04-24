import { ColumnDef } from '@tanstack/react-table'
import { MahasantriWithHafalan } from '@/types'

export const mahasantriColumns: ColumnDef<MahasantriWithHafalan>[] = [
    {
        accessorKey: 'mahasantri.nama',
        header: 'Nama',
        cell: ({ row }) => row.original.mahasantri.nama,
    },
    {
        accessorKey: 'mahasantri.nim',
        header: 'NIM',
        cell: ({ row }) => row.original.mahasantri.nim,
    },
    {
        accessorKey: 'mahasantri.jurusan',
        header: 'Jurusan',
        cell: ({ row }) => row.original.mahasantri.jurusan,
    },
]

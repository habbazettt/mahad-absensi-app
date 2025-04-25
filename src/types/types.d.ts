export interface Hafalan {
    id: number;
    mahasantri_id: number;
    mentor_id: number;
    juz: number;
    halaman: string;
    total_setoran: number;
    kategori: string;
    waktu: string;
    catatan: string;
    created_at: string;
    updated_at: string;
    original_created_at?: Date | null;
}

export interface Mahasantri {
    id: number
    nama: string
    nim: string
    jurusan: string
    gender: string
    mentor_id: number
}

export interface Mentor {
    id: number
    nama: string
    gender: string
}

export interface MahasantriWithHafalan {
    mahasantri: Mahasantri;
    list_hafalan: Hafalan[];
    summary: {
        total_perKategori: {
            ziyadah: number;
            murojaah: number;
        };
    };
}

export interface Pagination {
    current_page: number
    total_data: number
    total_pages: number
}

export interface MahasantriDialogProps {
    open: boolean
    onClose: () => void
    data: MahasantriWithHafalan[]
    currentPage: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
}

export interface SetoranDialogProps {
    open: boolean
    onClose: () => void
    data: Hafalan[]
    currentPage: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
}

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    sorting: SortingState;
    onSortingChange: (sorting: SortingState | Updater<SortingState>) => void;
}

export interface DeleteDialogProps {
    keyword: string;
    openDialog: boolean;
    setOpenDialog: (open: boolean) => void;
    handleDelete: () => void;
}

type RowData = Hafalan | Mahasantri

export interface ActionDropdownProps {
    row: {
        original: RowData;
    };
    setOpenDialog: (open: boolean) => void;
    setSelectedId: (id: number) => void;
    keyword: string;
    editPath: string;
}
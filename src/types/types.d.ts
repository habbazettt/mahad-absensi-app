/* eslint-disable @typescript-eslint/no-explicit-any */
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
    email: string
    mahasantri_count: number
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
    columnVisibility: ColumnVisibilityState;
    enablePagination?: boolean;
}

export interface DeleteDialogProps {
    keyword: string;
    openDialog: boolean;
    setOpenDialog: (open: boolean) => void;
    handleDelete: () => void;
}

type RowData = Hafalan | Mahasantri | TargetSemester | Mentor | Absensi | DetailLog

export interface ActionDropdownProps {
    row: {
        original: RowData;
    };
    onEdit?: () => void;
    editPath?: string;
    keyword: string;
    setOpenDialog: (open: boolean) => void;
    setSelectedId: (id: number) => void;
}

export interface TargetSemester {
    id: number
    mahasantri_id: number
    target: number
    semester: string
    tahun_ajaran: string
    keterangan: string
    created_at: string
    updated_at: string
}

export interface TargetSemesterDataProps {
    targetSemesterData: TargetSemester[]
}

export interface Column {
    id: keyof Hafalan;
}

export interface TokenPayload {
    id: number;
    role: string;
    exp: number;
}

export interface CsvColumnConfig<T> {
    key: keyof T;
    header: string;
    format?: (value: any) => string;
}

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asar: string;
    Maghrib: string;
    Isha: string;
}

export interface TimeWidgetProps {
    className?: string;
}

export interface AbsensiDailySummary {
    tanggal: string;
    shubuh: string;
    isya: string;
}

export interface Absensi {
    id: number;
    mahasantri_id: number;
    mentor_id: number;
    mahasantri: {
        id: number;
        nama: string;
    };
    mentor: {
        id: number;
        nama: string;
        gender: string;
    }
    waktu: 'shubuh' | 'isya';
    status: 'hadir' | 'izin' | 'alpa';
    tanggal: string;
    created_at: string;
}

export interface AbsensiDialogProps {
    open: boolean;
    onClose: () => void;
    data: Absensi[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface TodayAttendanceWidgetProps {
    className?: string;
}

export interface AttendanceSummary {
    mahasantriId: number;
    nama: string;
    totalHadir: number;
    totalIzin: number;
    totalAlpa: number;
}

export interface AbsensiCount {
    [date: string]: {
        hadir: number;
        izin: number;
        alpa: number;
    };
}

export interface RecommendationResult {
    tipe_rekomendasi: string;
    rekomendasi_jadwal: string;
    persentase_efektif_historis: number;
    estimasi_q_value: number;
}

export interface DetailLog {
    id: number;
    waktu_murojaah: string;
    status: string;
    catatan: string;
    updated_at: string;
    target_start_juz: number,
    target_start_halaman: number,
    target_end_juz: number,
    target_end_halaman: number,
    total_target_halaman: number,
    selesai_end_juz: number,
    selesai_end_halaman: number,
    total_selesai_halaman: number,
}

export interface LogHarian {
    id: number;
    tanggal: string;
    total_target_halaman: number;
    total_selesai_halaman: number;
    detail_logs: DetailLog[];
}

export interface HariProduktif {
    tanggal: string;
    total_selesai_halaman: number;
}

export interface Statistik {
    total_selesai_halaman: number;
    total_hari_aktif: number;
    rata_rata_halaman_per_hari: number;
    sesi_paling_produktif: string;
    hari_paling_produktif: HariProduktif;
}

export interface RekapMingguan {
    mahasantri_id: number;
    nama_mahasantri: string;
    total_target_halaman_mingguan: number;
    total_selesai_halaman_mingguan: number;
    persentase_pencapaian: number;
}

export interface MahasantriInfo {
    id: number;
    nama: string;
}

export interface DetailLogInMentorView {
    id: number;
    waktu_murojaah: string;
    target_start_juz: number;
    target_start_halaman: number;
    target_end_juz: number;
    target_end_halaman: number;
    total_target_halaman: number;
    selesai_end_juz: number;
    selesai_end_halaman: number;
    total_selesai_halaman: number;
    status: string;
    catatan: string;
    updated_at: string;
}

export interface LogHarianMahasantri {
    log_id: number;
    tanggal: string;
    total_target_halaman: number;
    total_selesai_halaman: number;
    mahasantri: MahasantriInfo;
    detail_logs: DetailLogInMentorView[];
}

export interface Recommendation {
    id: number;
    state: string;
    mahasantri_id?: number;
    mentor_id?: number;
    rekomendasi_jadwal: string;
    tipe_rekomendasi: string;
    estimasi_q_value?: number;
    persentase_efektif_historis?: number;
}
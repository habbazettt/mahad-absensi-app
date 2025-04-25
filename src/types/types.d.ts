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

export interface MahasantriPagination {
    current_page: number
    total_mahasantri: number
    total_pages: number
}

export interface HafalanPagination {
    current_page: number,
    total_hafalan: number,
    total_pages: number
}
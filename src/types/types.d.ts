export interface Hafalan {
    id: number
    mahasantri_id: number
    mentor_id: number
    juz: number
    halaman: string
    total_setoran: number
    kategori: string
    waktu: string
    catatan: string
    created_at: string
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

interface MahasantriPagination {
    current_page: number
    total_mahasantri: number
    total_pages: number
}
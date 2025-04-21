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
    updated_at: string
}

export interface Mahasantri {
    id: number
    nama: string
    nim: string
    jurusan: string
    gender: string
    mentorId: number
}

export interface MahasantriWithHafalan {
    mahasantri: Mahasantri
    list_hafalan: Hafalan[]
}

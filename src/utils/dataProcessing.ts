import { MahasantriWithHafalan } from "@/types";

export const processSetoranData = (mahasantriList: MahasantriWithHafalan[]) => {
    const allHafalan = mahasantriList.flatMap(mahasantri =>
        mahasantri.list_hafalan.map(hafalan => ({
            created_at: hafalan.created_at,
            total_setoran: hafalan.total_setoran,
            kategori: hafalan.kategori,
        }))
    );

    const groupByDate = allHafalan.reduce<{ [key: string]: { [key: string]: number } }>((acc, { created_at, total_setoran, kategori }) => {
        const date = new Date(created_at);

        const formattedDate = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/\./g, '');

        if (!acc[formattedDate]) acc[formattedDate] = { ziyadah: 0, murojaah: 0 };
        acc[formattedDate][kategori] = (acc[formattedDate][kategori] || 0) + total_setoran;

        return acc;
    }, {});

    const chartData = Object.entries(groupByDate).map(([date, setoran]) => ({
        date,
        kategori: setoran,
    }));

    return chartData;
};

export const processSetoranDataPerMahasantri = (mahasantriList: MahasantriWithHafalan[]) => {
    const setoranPerMahasantri = mahasantriList.map(mahasantri => {
        const nama = mahasantri.mahasantri.nama;
        const ziyadah = mahasantri.summary?.total_perKategori?.ziyadah || 0;
        const murojaah = mahasantri.summary?.total_perKategori?.murojaah || 0;

        return { nama, ziyadah, murojaah };
    });

    return setoranPerMahasantri;
};


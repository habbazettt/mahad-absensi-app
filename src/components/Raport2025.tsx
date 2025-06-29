import { useEffect, useState } from "react";
import { AlertCircle, Inbox, Trophy, Medal, Award } from "lucide-react";

interface RaportTahunan {
    id: number;
    nama: string;
    nim: number;
    mentor: string;
    keaktifan_ritma_ganjil: string;
    target_dan_ujian_ganjil: string;
    keaktifan_mahasantri_ganjil: string;
    nilai_akhir_ganjil: string;
    keaktifan_ritma_genap: string;
    target_dan_ujian_genap: string;
    keaktifan_mahasantri_genap: string;
    nilai_akhir_genap: string;
    golden_ticket: string;
    total_nilai: string;
    keterangan: string;
    predikat: string;
    rank: number;
}

const getPredikatBadgeClass = (predikat: string): string => {
    switch (predikat) {
        case "A":
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        case "B":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case "C":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
        case "D":
            return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};

const getKeteranganBadgeClass = (keterangan: string): string => {
    switch (keterangan) {
        case "LULUS":
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        case "TIDAK LULUS":
            return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};

const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank <= 10) return <Medal className="h-5 w-5 text-gray-500" />;
    if (rank <= 20) return <Award className="h-5 w-5 text-orange-500" />;
    return null;
};

export default function RaportTahun2025() {
    const [raportData, setRaportData] = useState<RaportTahunan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRaport = async () => {
            setLoading(true);
            setError("");

            try {
                const authToken = localStorage.getItem("auth_token");
                const userData = localStorage.getItem("user");

                if (!authToken) {
                    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
                }

                if (!userData) {
                    throw new Error("Data user tidak ditemukan. Silakan login kembali.");
                }

                const user = JSON.parse(userData);
                const userNim = user.nim;

                if (!userNim) {
                    throw new Error("NIM tidak ditemukan dalam data user.");
                }

                const apiUrl = import.meta.env.VITE_RAPORT_2025_URL;

                if (!apiUrl) {
                    throw new Error("URL raport tahunan tidak dikonfigurasi. Periksa environment variable VITE_RAPORT_2025_URL.");
                }

                const response = await fetch(apiUrl, {
                    method: 'GET',
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
                }

                // Cek content type
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const responseText = await response.text();
                    console.error("Non-JSON response:", responseText.substring(0, 200));
                    throw new Error("Server mengembalikan response bukan JSON. Periksa URL endpoint atau konfigurasi server.");
                }

                const responseData = await response.json();

                // Handle different response structures dan filter berdasarkan NIM
                let allRaportData = [];
                if (Array.isArray(responseData)) {
                    allRaportData = responseData;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    allRaportData = responseData.data;
                } else {
                    console.warn("Unexpected response structure:", responseData);
                    allRaportData = [];
                }

                // Filter data berdasarkan NIM user yang login
                const userRaport = allRaportData.find((raport: RaportTahunan) =>
                    raport.nim.toString() === userNim.toString()
                );

                if (!userRaport) {
                    throw new Error("Data raport untuk NIM Anda tidak ditemukan.");
                }

                setRaportData(userRaport);
            } catch (err) {
                let errorMessage = "Terjadi kesalahan tidak diketahui.";

                if (err instanceof Error) {
                    if (err.message.includes("Failed to fetch")) {
                        errorMessage = "Gagal terhubung ke server. Periksa koneksi internet atau URL endpoint.";
                    } else if (err.message.includes("SyntaxError")) {
                        errorMessage = "Server mengembalikan data yang tidak valid. Periksa URL endpoint.";
                    } else {
                        errorMessage = err.message;
                    }
                }

                setError(errorMessage);
                console.error("Gagal mengambil raport tahunan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRaport();
    }, []);

    // Tampilan Skeleton saat loading
    if (loading) {
        return (
            <div className="rounded-lg border bg-white shadow-sm p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 w-full mx-auto">
                <div className="h-6 sm:h-8 w-full sm:w-1/2 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2 sm:space-y-3 pt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-12 sm:h-16 w-full bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white shadow-sm p-3 sm:p-4 md:p-6 space-y-4 w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <h3 className="font-semibold text-base sm:text-lg">Raport Tahun 2025</h3>
                {raportData && (
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                        Mentor: {raportData.mentor}
                    </div>
                )}
            </div>

            {/* Penanganan Error */}
            {error && (
                <div className="rounded-lg border bg-red-50 text-red-700 p-3 sm:p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="break-words">{error}</span>
                </div>
            )}

            {/* Tampilan Raport */}
            {!error && raportData && (
                <div className="space-y-4 sm:space-y-6">
                    {/* Card Header dengan Info Utama */}
                    <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-blue-25 p-4 sm:p-6">
                        {/* Bagian Atas - Nama & Info Utama */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                {getRankIcon(raportData.rank)}
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-700 truncate">{raportData.nama}</h2>
                                    <p className="text-xs sm:text-sm text-gray-600">NIM: {raportData.nim}</p>
                                </div>
                            </div>

                            {/* Predikat & Ranking - Responsive */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                                <div className="flex-shrink-0">
                                    <span className={`px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg font-bold rounded-full ${getPredikatBadgeClass(raportData.predikat)}`}>
                                        Predikat {raportData.predikat}
                                    </span>
                                </div>
                                <div className="text-center flex-shrink-0">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">#{raportData.rank}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Ranking</div>
                                </div>
                            </div>
                        </div>

                        {/* Bagian Bawah - Total Nilai */}
                        <div className="flex items-center justify-end">
                            <div className="text-right">
                                <div className="text-xs sm:text-sm text-gray-600">Nilai Akhir</div>
                                <div className="text-xl sm:text-2xl font-bold text-blue-700">{raportData.total_nilai}</div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Nilai - Semester Ganjil */}
                    <div className="rounded-lg border bg-white p-4 sm:p-6">
                        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-green-700">Semester Ganjil</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-green-50">
                                <span className="text-xs sm:text-sm text-gray-600 block">Keaktifan Ritma</span>
                                <div className="text-lg sm:text-xl font-bold text-green-700 break-words">{raportData.keaktifan_ritma_ganjil || "-"}</div>
                            </div>
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-green-50">
                                <span className="text-xs sm:text-sm text-gray-600 block">Target & Ujian</span>
                                <div className="text-lg sm:text-xl font-bold text-green-700 break-words">{raportData.target_dan_ujian_ganjil || "-"}</div>
                            </div>
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-green-50">
                                <span className="text-xs sm:text-sm text-gray-600 block">Keaktifan Mahasantri</span>
                                <div className="text-lg sm:text-xl font-bold text-green-700 break-words">{raportData.keaktifan_mahasantri_ganjil || "-"}</div>
                            </div>
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-green-100 border border-green-200">
                                <span className="text-xs sm:text-sm text-gray-600 block">Nilai Akhir</span>
                                <div className="text-xl sm:text-2xl font-bold text-green-800 break-words">{raportData.nilai_akhir_ganjil || "-"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Nilai - Semester Genap */}
                    <div className="rounded-lg border bg-white p-4 sm:p-6">
                        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-purple-700">Semester Genap</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-purple-50">
                                <span className="text-xs sm:text-sm text-gray-600 block">Keaktifan Ritma</span>
                                <div className="text-lg sm:text-xl font-bold text-purple-700 break-words">{raportData.keaktifan_ritma_genap || "-"}</div>
                            </div>
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-purple-50">
                                <span className="text-xs sm:text-sm text-gray-600 block">Target & Ujian</span>
                                <div className="text-lg sm:text-xl font-bold text-purple-700 break-words">{raportData.target_dan_ujian_genap || "-"}</div>
                            </div>
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-purple-50">
                                <span className="text-xs sm:text-sm text-gray-600 block">Keaktifan Mahasantri</span>
                                <div className="text-lg sm:text-xl font-bold text-purple-700 break-words">{raportData.keaktifan_mahasantri_genap || "-"}</div>
                            </div>
                            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-purple-100 border border-purple-200">
                                <span className="text-xs sm:text-sm text-gray-600 block">Nilai Akhir</span>
                                <div className="text-xl sm:text-2xl font-bold text-purple-800 break-words">{raportData.nilai_akhir_genap || "-"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Golden Ticket */}
                    <div className="rounded-lg border bg-yellow-50 p-4 sm:p-6">
                        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-yellow-700">Golden Ticket</h3>
                        <div className="text-lg sm:text-xl font-bold text-yellow-800 break-words">
                            {raportData.golden_ticket || "-"}
                        </div>
                    </div>

                    {/* Status Kelulusan - Paling Bawah */}
                    <div className="rounded-lg border-2 p-4 sm:p-6 lg:p-8 text-center">
                        <div className="mb-3 sm:mb-4">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2">Status Kelulusan</h3>
                        </div>
                        <div className={`inline-block px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 text-2xl sm:text-3xl lg:text-4xl font-bold rounded-xl lg:rounded-2xl ${getKeteranganBadgeClass(raportData.keterangan)} shadow-lg`}>
                            {raportData.keterangan}
                        </div>
                        {raportData.keterangan === "LULUS" && (
                            <div className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-green-600 px-2">
                                🎉 Selamat! Anda telah berhasil menyelesaikan tahun ini dengan baik.
                            </div>
                        )}
                        {raportData.keterangan === "TIDAK LULUS" && (
                            <div className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-red-600 px-2">
                                💪 Jangan menyerah! Terus belajar dan tingkatkan prestasi Anda.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tampilan ketika tidak ada data */}
            {!error && !raportData && !loading && (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 p-6 sm:p-10">
                    <Inbox className="h-10 w-10 sm:h-12 sm:w-12 mb-2" />
                    <p className="font-semibold text-sm sm:text-base">Raport Tidak Ditemukan</p>
                    <p className="text-xs sm:text-sm">Data raport tahunan untuk NIM Anda belum tersedia.</p>
                </div>
            )}
        </div>
    );
}
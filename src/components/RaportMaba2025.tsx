import { useEffect, useState } from "react";
import { AlertCircle, Inbox } from "lucide-react";

interface RaportTahunan {
    id: number;
    nama: string;
    maba_id: number;
    keterangan: string;
}

const getKeteranganBadgeClass = (keterangan: string): string => {
    switch (keterangan) {
        case "Lulus":
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        case "Tidak Lulus":
            return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};

export default function RaportMaba2025() {
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

                const apiUrl = import.meta.env.VITE_RAPORT_MABA_2025_URL;

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

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const responseText = await response.text();
                    console.error("Non-JSON response:", responseText.substring(0, 200));
                    throw new Error("Server mengembalikan response bukan JSON. Periksa URL endpoint atau konfigurasi server.");
                }

                const responseData = await response.json();

                let allRaportData = [];
                if (Array.isArray(responseData)) {
                    allRaportData = responseData;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    allRaportData = responseData.data;
                } else {
                    console.warn("Unexpected response structure:", responseData);
                    allRaportData = [];
                }

                const userRaport = allRaportData.find((raport: RaportTahunan) =>
                    raport.maba_id.toString() === userNim.toString()
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
                <h3 className="font-semibold text-base sm:text-lg">Raport Kelulusan Mahasantri Baru 2025</h3>
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
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-700 truncate">{raportData.nama}</h2>
                                    <p className="text-xs sm:text-sm text-gray-600">ID: {raportData.maba_id}</p>
                                </div>
                            </div>
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
                        {raportData.keterangan === "Lulus" && (
                            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                                <div className="text-sm sm:text-base lg:text-lg text-green-600 px-2">
                                    🎉 Selamat! Anda lolos sebagai mahasantri baru Mahad Tahfidz Al-Qur'an UIN Bandung tahun ajaran 2025/2026
                                </div>
                                <div className="flex justify-center">
                                    <a
                                        href="https://chat.whatsapp.com/IJTPCWXG8FqLwelliT5yhR"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                        </svg>
                                        Bergabung ke Grup WhatsApp
                                    </a>
                                </div>
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
                    <p className="text-xs sm:text-sm">Data raport tahunan untuk ID Anda belum tersedia.</p>
                </div>
            )}
        </div>
    );
}
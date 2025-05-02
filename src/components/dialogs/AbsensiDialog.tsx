import { AbsensiDialogProps } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AbsensiDialog({
    open,
    onClose,
    data,
    currentPage,
    totalPages,
    onPageChange
}: AbsensiDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Detail Absensi</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {data.map((absensi, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-medium">{absensi.mahasantri.nama}</h3>
                                <p className="text-sm text-gray-600">
                                    {absensi.waktu} • {absensi.tanggal}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${absensi.status === 'hadir' ? 'bg-green-100 text-green-800' :
                                absensi.status === 'izin' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {absensi.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Sebelumnya
                    </Button>

                    <div className="text-sm text-gray-600">
                        Halaman {currentPage} dari {totalPages}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
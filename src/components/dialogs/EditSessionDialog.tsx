import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface DetailLog {
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
}

interface EditSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionData: DetailLog | null;
    onSuccess: () => void;
}

const statusStyles: { [key: string]: { container: string; header: string; label: string; value: string; } } = {
    "Selesai": {
        container: "bg-green-50 border-green-200",
        header: "text-green-900",
        label: "text-green-700",
        value: "font-bold ml-2 text-green-950",
    },
    "Berjalan": {
        container: "bg-blue-50 border-blue-200",
        header: "text-blue-900",
        label: "text-blue-700",
        value: "font-bold ml-2 text-blue-950",
    },
    "Belum Selesai": {
        container: "bg-gray-100 border-gray-200",
        header: "text-gray-800",
        label: "text-gray-600",
        value: "font-bold ml-2 text-gray-900",
    },
};

export default function EditSessionDialog({
    open,
    onOpenChange,
    sessionData,
    onSuccess,
}: EditSessionDialogProps) {
    const [formData, setFormData] = useState({
        selesai_end_juz: 0,
        selesai_end_halaman: 0,
        catatan: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && sessionData) {
            setFormData({
                selesai_end_juz: sessionData.selesai_end_juz,
                selesai_end_halaman: sessionData.selesai_end_halaman,
                catatan: sessionData.catatan,
            });
        }
    }, [open, sessionData]);

    const handleInputChange = (field: keyof typeof formData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Kalkulasi total halaman selesai
    const calculateCompletedPages = (): number => {
        if (!sessionData) return 0;

        const { selesai_end_juz, selesai_end_halaman } = formData;
        const { target_start_juz, target_start_halaman } = sessionData;

        if (selesai_end_juz === 0 && selesai_end_halaman === 0) return 0;

        let totalPages = 0;

        if (target_start_juz === selesai_end_juz) {
            totalPages = selesai_end_halaman - target_start_halaman + 1;
        } else {
            totalPages += (20 - target_start_halaman + 1);

            for (let juz = target_start_juz + 1; juz < selesai_end_juz; juz++) {
                totalPages += 20;
            }

            totalPages += selesai_end_halaman;
        }

        return Math.max(0, totalPages);
    };

    const getPredictedStatus = (): string => {
        if (!sessionData) return "Belum Selesai";
        const completed = calculateCompletedPages();
        const target = sessionData.total_target_halaman;

        if (completed >= target) return "Selesai";
        if (completed > 0) return "Berjalan";
        return "Belum Selesai";
    };

    const validateForm = (): boolean => {
        if (!sessionData) return false;

        const { selesai_end_juz, selesai_end_halaman } = formData;

        if (selesai_end_juz > sessionData.target_end_juz) {
            toast.error("Juz selesai tidak boleh melebihi target juz");
            return false;
        }

        if (selesai_end_juz === sessionData.target_end_juz &&
            selesai_end_halaman > sessionData.target_end_halaman) {
            toast.error("Halaman selesai tidak boleh melebihi target halaman");
            return false;
        }

        // Validasi bahwa selesai tidak boleh kurang dari target awal
        if (selesai_end_juz < sessionData.target_start_juz) {
            toast.error("Juz selesai tidak boleh kurang dari juz awal target");
            return false;
        }

        if (selesai_end_juz === sessionData.target_start_juz &&
            selesai_end_halaman < sessionData.target_start_halaman) {
            toast.error("Halaman selesai tidak boleh kurang dari halaman awal target");
            return false;
        }

        // Validasi halaman (1-20 untuk setiap juz)
        if (selesai_end_halaman < 1 || selesai_end_halaman > 20) {
            toast.error("Halaman harus antara 1-20");
            return false;
        }

        // Validasi juz (1-30)
        if (selesai_end_juz < 1 || selesai_end_juz > 30) {
            toast.error("Juz harus antara 1-30");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!sessionData || !validateForm()) return;

        setLoading(true);
        const toastId = toast.loading("Mengupdate sesi murojaah...");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/log-harian/detail/${sessionData.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Gagal mengupdate sesi murojaah");
            }

            toast.success("Sesi murojaah berhasil diupdate!", { id: toastId });
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onOpenChange(false);
        }
    };

    if (!sessionData) return null;

    const currentStatus = getPredictedStatus();
    const styles = statusStyles[currentStatus] || statusStyles["Belum Selesai"];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Sesi Murojaah</DialogTitle>
                    <DialogDescription>
                        Update progress murojaah Anda untuk sesi {sessionData.waktu_murojaah}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Info Target*/}
                    <div className="bg-muted/50 p-4 rounded-lg border">
                        {/* // Label dibuat lebih menonjol */}
                        <h4 className="font-semibold text-base mb-2">Target Sesi Murojaah Anda:</h4>
                        <div className="flex items-baseline gap-2">
                            {/* // Angka target dibuat lebih besar dan tebal agar mudah dilihat */}
                            <p className="text-xl font-bold text-primary">
                                Juz {sessionData.target_start_juz} Hal {sessionData.target_start_halaman}
                            </p>
                            <span className="text-sm text-muted-foreground">-</span>
                            <p className="text-xl font-bold text-primary">
                                Juz {sessionData.target_end_juz} Hal {sessionData.target_end_halaman}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Total Target: {sessionData.total_target_halaman} halaman
                        </p>
                    </div>

                    {/* Progress Selesai*/}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            {/* // Label diubah agar lebih intuitif */}
                            <Label htmlFor="selesai_end_juz">Selesai di Juz</Label>
                            {/* // Deskripsi ditambahkan untuk memandu pengguna */}
                            <p className="text-xs text-muted-foreground -mt-1">Posisi Juz terakhir Anda membaca.</p>
                            <Input
                                id="selesai_end_juz"
                                type="number"
                                min={sessionData.target_start_juz}
                                max={sessionData.target_end_juz}
                                value={formData.selesai_end_juz}
                                onChange={(e) => handleInputChange("selesai_end_juz", parseInt(e.target.value) || 0)}
                                disabled={loading}
                                className="no-spinner"
                            />
                        </div>
                        <div className="grid gap-2">
                            {/* // Label diubah agar lebih intuitif */}
                            <Label htmlFor="selesai_end_halaman">Selesai di Halaman</Label>
                            {/* // Deskripsi ditambahkan untuk memandu pengguna */}
                            <p className="text-xs text-muted-foreground -mt-1">Posisi Halaman terakhir Anda membaca.</p>
                            <Input
                                id="selesai_end_halaman"
                                type="number"
                                // -- VALIDASI DINAMIS DITERAPKAN DISINI --
                                min={formData.selesai_end_juz === sessionData.target_start_juz ? sessionData.target_start_halaman : 1}
                                max={formData.selesai_end_juz === sessionData.target_end_juz ? sessionData.target_end_halaman : 20}
                                value={formData.selesai_end_halaman}
                                onChange={(e) => handleInputChange("selesai_end_halaman", parseInt(e.target.value) || 0)}
                                disabled={loading}
                                className="no-spinner"
                            />
                        </div>
                    </div>

                    {/* Info Progress (dengan styling dinamis) */}
                    <div className={`p-4 rounded-lg border ${styles.container}`}>
                        <h4 className={`font-medium mb-2 ${styles.header}`}>Rekapitulasi Progres:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className={styles.label}>Total Selesai:</span>
                                <span className={styles.value}>{calculateCompletedPages()} halaman</span>
                            </div>
                            <div>
                                <span className={styles.label}>Persentase:</span>
                                <span className={styles.value}>
                                    {sessionData.total_target_halaman > 0
                                        ? `${((calculateCompletedPages() / sessionData.total_target_halaman) * 100).toFixed(1)}%`
                                        : "0%"
                                    }
                                </span>
                            </div>
                            <div>
                                <span className={styles.label}>Status Baru:</span>
                                <span className={styles.value}>{currentStatus}</span>
                            </div>
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="grid gap-2">
                        <Label htmlFor="catatan">Catatan (Opsional)</Label>
                        <Textarea
                            id="catatan"
                            placeholder="Tambahkan catatan untuk sesi ini..."
                            value={formData.catatan}
                            onChange={(e) => handleInputChange("catatan", e.target.value)}
                            disabled={loading}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
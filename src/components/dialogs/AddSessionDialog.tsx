import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface AddSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date;
    onSuccess: () => void;
}

interface FormData {
    waktu_murojaah: string;
    target_start_juz: string;
    target_start_halaman: string;
    target_end_juz: string;
    target_end_halaman: string;
    catatan: string;
}

const waktuOptions = [
    { display: "Ba'da Shubuh", value: "bada shubuh" },
    { display: "Pagi Hari", value: "pagi hari" },
    { display: "Siang Hari", value: "siang hari" },
    { display: "Ba'da Dzuhur", value: "bada dzuhur" },
    { display: "Sore Hari", value: "sore hari" },
    { display: "Ba'da Ashar", value: "bada ashar" },
    { display: "Ba'da Maghrib", value: "bada maghrib" },
    { display: "Ba'da Isya", value: "bada isya" },
    { display: "Malam Hari", value: "malam hari" },
];

export default function AddSessionDialog({
    open,
    onOpenChange,
    selectedDate,
    onSuccess
}: AddSessionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        waktu_murojaah: "",
        target_start_juz: "",
        target_start_halaman: "",
        target_end_juz: "",
        target_end_halaman: "",
        catatan: "",
    });

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const resetForm = () => {
        setFormData({
            waktu_murojaah: "",
            target_start_juz: "",
            target_start_halaman: "",
            target_end_juz: "",
            target_end_halaman: "",
            catatan: "",
        });
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.waktu_murojaah) {
            toast.error("Waktu murojaah harus diisi");
            return false;
        }
        if (!formData.target_start_juz || !formData.target_start_halaman) {
            toast.error("Target awal (juz dan halaman) harus diisi");
            return false;
        }
        if (!formData.target_end_juz || !formData.target_end_halaman) {
            toast.error("Target akhir (juz dan halaman) harus diisi");
            return false;
        }

        // Validasi range juz dan halaman
        const startJuz = parseInt(formData.target_start_juz);
        const startHal = parseInt(formData.target_start_halaman);
        const endJuz = parseInt(formData.target_end_juz);
        const endHal = parseInt(formData.target_end_halaman);

        if (startJuz < 1 || startJuz > 30 || endJuz < 1 || endJuz > 30) {
            toast.error("Juz harus antara 1-30");
            return false;
        }

        if (startHal < 1 || startHal > 20 || endHal < 1 || endHal > 20) {
            toast.error("Halaman harus antara 1-20");
            return false;
        }

        if (startJuz > endJuz || (startJuz === endJuz && startHal > endHal)) {
            toast.error("Target akhir harus lebih besar atau sama dengan target awal");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const toastId = toast.loading("Menambahkan sesi...");

        try {
            const payload = {
                tanggal: formatDate(selectedDate),
                waktu_murojaah: formData.waktu_murojaah,
                target_start_juz: parseInt(formData.target_start_juz),
                target_start_halaman: parseInt(formData.target_start_halaman),
                target_end_juz: parseInt(formData.target_end_juz),
                target_end_halaman: parseInt(formData.target_end_halaman),
                catatan: formData.catatan || "",
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/log-harian/detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Gagal menambahkan sesi");
            }

            toast.success("Sesi murojaah berhasil ditambahkan!", { id: toastId });
            resetForm();
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Sesi Murojaah</DialogTitle>
                    <DialogDescription>
                        Tambahkan sesi murojaah baru untuk tanggal {formatDisplayDate(selectedDate)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="waktu_murojaah">Waktu Murojaah *</Label>
                        <Select
                            value={formData.waktu_murojaah}
                            onValueChange={(value) => handleInputChange('waktu_murojaah', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih waktu murojaah" />
                            </SelectTrigger>
                            <SelectContent>
                                {waktuOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.display}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-lg font-medium">Target Murojaah</Label>

                        <div className="space-y-4">

                            {/* GRUP 1: TITIK AWAL TARGET */}
                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Mulai Dari</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Tentukan posisi awal target murojaah Anda.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="target_start_juz" className="text-xs">Juz Awal *</Label>
                                        <Input
                                            id="target_start_juz"
                                            type="number"
                                            min="1"
                                            max="30"
                                            placeholder="Contoh: 1"
                                            value={formData.target_start_juz}
                                            onChange={(e) => handleInputChange('target_start_juz', e.target.value)}
                                            className="no-spinner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="target_start_halaman" className="text-xs">Halaman Awal *</Label>
                                        <Input
                                            id="target_start_halaman"
                                            type="number"
                                            min="1"
                                            max="20"
                                            placeholder="Contoh: 1"
                                            value={formData.target_start_halaman}
                                            onChange={(e) => handleInputChange('target_start_halaman', e.target.value)}
                                            className="no-spinner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* GRUP 2: TITIK AKHIR TARGET */}
                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Selesai Di</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Tentukan posisi akhir target murojaah Anda.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="target_end_juz" className="text-xs">Juz Akhir *</Label>
                                        <Input
                                            id="target_end_juz"
                                            type="number"
                                            min={formData.target_start_juz || 1}
                                            max="30"
                                            placeholder="Contoh: 1"
                                            value={formData.target_end_juz}
                                            onChange={(e) => handleInputChange('target_end_juz', e.target.value)}
                                            className="no-spinner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="target_end_halaman" className="text-xs">Halaman Akhir *</Label>
                                        <Input
                                            id="target_end_halaman"
                                            type="number"
                                            min={formData.target_start_juz === formData.target_end_juz ? (parseInt(formData.target_start_halaman) || 0) + 1 : 1}
                                            max="20"
                                            placeholder="Contoh: 20"
                                            value={formData.target_end_halaman}
                                            onChange={(e) => handleInputChange('target_end_halaman', e.target.value)}
                                            className="no-spinner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="catatan">Catatan</Label>
                        <Textarea
                            id="catatan"
                            placeholder="Tambahkan catatan untuk sesi ini (opsional)..."
                            value={formData.catatan}
                            onChange={(e: { target: { value: string; }; }) => handleInputChange('catatan', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Sesi"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
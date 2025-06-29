import { useState } from "react";
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
import { Recommendation } from "@/types";
import toast from "react-hot-toast";

interface ApplyAiTargetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rekomendasi: Recommendation | null;
    onSuccess: () => void;
}

export default function ApplyAiTargetDialog({
    open,
    onOpenChange,
    rekomendasi,
    onSuccess,
}: ApplyAiTargetDialogProps) {
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState({
        startJuz: "", startHalaman: "",
        endJuz: "", endHalaman: "",
        catatan: "",
    });

    if (!rekomendasi) return null;

    const handleInputChange = (field: keyof typeof target, value: string) => {
        setTarget(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Lakukan validasi sederhana di frontend
        if (!target.startJuz || !target.startHalaman || !target.endJuz || !target.endHalaman) {
            toast.error("Semua field target (Juz dan Halaman) harus diisi.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Menerapkan rekomendasi...");

        try {
            const payload = {
                rekomendasi_id: rekomendasi.id,
                target_start_juz: parseInt(target.startJuz),
                target_start_halaman: parseInt(target.startHalaman),
                target_end_juz: parseInt(target.endJuz),
                target_end_halaman: parseInt(target.endHalaman),
                catatan: target.catatan,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/log-harian/detail/dari-rekomendasi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Gagal menerapkan rekomendasi");
            }

            toast.success("Rekomendasi berhasil diterapkan ke log harian!", { id: toastId });
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Terapkan Rekomendasi</DialogTitle>
                    <DialogDescription>
                        Anda akan menerapkan jadwal <span className="font-semibold text-primary">{rekomendasi.rekomendasi_jadwal}</span>. Masukkan target murojaah Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="target_start_juz">Mulai Juz</Label>
                            <Input className="no-spinner" id="target_start_juz" type="number" placeholder="Contoh: 1" value={target.startJuz} onChange={(e) => handleInputChange('startJuz', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target_start_halaman">Mulai Halaman</Label>
                            <Input className="no-spinner" id="target_start_halaman" type="number" placeholder="Contoh: 1" value={target.startHalaman} onChange={(e) => handleInputChange('startHalaman', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="target_end_juz">Selesai Juz</Label>
                            <Input className="no-spinner" id="target_end_juz" type="number" placeholder="Contoh: 1" value={target.endJuz} onChange={(e) => handleInputChange('endJuz', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target_end_halaman">Selesai Halaman</Label>
                            <Input className="no-spinner" id="target_end_halaman" type="number" placeholder="Contoh: 20" value={target.endHalaman} onChange={(e) => handleInputChange('endHalaman', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="catatan">Catatan (Opsional)</Label>
                        <Textarea id="catatan" placeholder="Tambahkan catatan..." value={target.catatan} onChange={(e) => handleInputChange('catatan', e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
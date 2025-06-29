import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Recommendation } from "@/types";
import { useState } from "react";
import ApplyAiTargetDialog from "./ApplyAITargetDialog";

interface RekomendasiHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    historyData: Recommendation[];
    loading: boolean;
    onSuccess: () => void;
}

export default function RekomendasiHistoryDialog({
    open,
    onOpenChange,
    historyData,
    loading,
    onSuccess,
}: RekomendasiHistoryDialogProps) {

    const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
    const [selectedRekomendasi, setSelectedRekomendasi] = useState<Recommendation | null>(null);

    const handleSelectForApply = (rekomendasi: Recommendation) => {
        setSelectedRekomendasi(rekomendasi);
        setIsTargetDialogOpen(true);
    };

    const handleApplySuccess = () => {
        onSuccess();
        onOpenChange(false);
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                        <DialogTitle>Riwayat Rekomendasi AI</DialogTitle>
                        <DialogDescription>
                            Pilih salah satu riwayat rekomendasi untuk diterapkan ke log harian Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <p className="text-center p-8">Memuat riwayat...</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu Rekomendasi</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead>Q-Value</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyData.length > 0 ? (
                                        historyData.map((rec) => (
                                            <TableRow key={rec.id}>
                                                <TableCell className="font-medium">{rec.rekomendasi_jadwal}</TableCell>
                                                <TableCell>{rec.tipe_rekomendasi}</TableCell>
                                                <TableCell>{rec.estimasi_q_value?.toFixed(2) ?? '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSelectForApply(rec)}
                                                    >
                                                        Terapkan
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                Belum ada riwayat rekomendasi.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ApplyAiTargetDialog
                open={isTargetDialogOpen}
                onOpenChange={setIsTargetDialogOpen}
                rekomendasi={selectedRekomendasi}
                onSuccess={handleApplySuccess}
            />
        </>
    );
}
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "@/components/ui/alert-dialog"
import { DialogDataTable } from "@/components/ui/data-table"
import { setoranColumns } from "@/components/columns/SetoranColumns"
import { SetoranDialogProps } from "@/types"

export default function SetoranDialog({
    open, onClose, data, currentPage, totalPages, onPrev, onNext
}: SetoranDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-screen max-w-5xl overflow-visible">
                <AlertDialogHeader>
                    <AlertDialogTitle>Daftar Hafalan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Berikut adalah daftar hafalan yang telah disetorkan oleh mahasantri.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="w-full overflow-x-auto max-w-full max-h-[60vh]">
                    <DialogDataTable columns={setoranColumns} data={data} />
                    <div className="flex justify-between mt-4">
                        <button onClick={onPrev} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <button onClick={onNext} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">
                            Next
                        </button>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
    )
}

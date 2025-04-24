import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/ui/data-table"
import { mahasantriColumns } from "@/components/columns/MahasantriColumns"
import { MahasantriWithHafalan } from "@/types"

interface MahasantriDialogProps {
    open: boolean
    onClose: () => void
    data: MahasantriWithHafalan[]
    currentPage: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
}

export default function MahasantriDialog({
    open, onClose, data, currentPage, totalPages, onPrev, onNext
}: MahasantriDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-screen max-w-5xl overflow-visible">
                <AlertDialogHeader>
                    <AlertDialogTitle>Mahasantri List</AlertDialogTitle>
                    <AlertDialogDescription>
                        Below is the list of Mahasantri assigned to you.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="w-full overflow-x-auto max-w-full max-h-[50vh]">
                    <DataTable columns={mahasantriColumns} data={data} />
                    <div className="flex justify-between mt-4">
                        <button onClick={onPrev} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
                        <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
                        <button onClick={onNext} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

import { AnimatePresence, motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogPortal, AlertDialogTitle } from "../ui/alert-dialog";
import { cn } from "@/lib/utils";
import { DeleteDialogProps } from "@/types";

export default function DeleteDialogComponent({ openDialog, setOpenDialog, handleDelete, keyword }: DeleteDialogProps) {
    return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogPortal>
                <AnimatePresence>
                    {openDialog && (
                        <motion.div
                            key="alert-dialog"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 flex items-center justify-center"
                        >
                            <AlertDialogContent className={cn("transition-none")}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Yakin ingin menghapus {keyword}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini akan menghapus {keyword.toLocaleLowerCase()} secara permanen.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setOpenDialog(false)}>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="hover:cursor-pointer">Iya, Hapus {keyword}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </AlertDialogPortal>
        </AlertDialog>
    );
}
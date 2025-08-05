import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { ActionDropdownProps } from "@/types";

export default function ActionDropdown({
    row,
    onEdit,
    editPath,
    keyword,
    setOpenDialog,
    setSelectedId,
}: ActionDropdownProps) {
    const [open, setOpen] = useState(false);

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else if (editPath) {
            window.location.href = `${editPath}/${row.original.id}`;
        }
        setOpen(false);
    };

    const handleDelete = () => {
        setSelectedId(row.original.id);
        setOpenDialog(true);
        setOpen(false);
    };


    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Buka menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit {keyword}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus {keyword}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
import { Edit, Info, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { ActionDropdownProps } from "@/types";

export default function ActionDropdown({ row, setOpenDialog, setSelectedId, keyword, editPath }: ActionDropdownProps) {
    const navigate = useNavigate();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {
                    keyword === "Mahasantri" && (
                        <DropdownMenuItem
                            onClick={() => navigate(`/dashboard/info-mahasantri/detail/${row.original.id}`)}
                        >
                            <Info className="text-green-400" />
                            Detail {keyword}
                        </DropdownMenuItem>
                    )
                }
                <DropdownMenuItem
                    onClick={() => navigate(`${editPath}/${row.original.id}`)}
                >
                    <Edit className="text-blue-400" />
                    Edit {keyword}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        setOpenDialog(true);
                        setSelectedId(row.original.id);
                    }}
                >
                    <Trash className="text-red-400" />
                    Hapus {keyword}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
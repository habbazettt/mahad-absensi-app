import { Pagination } from "@/types";
import { Button } from "./ui/button";

type PaginationProps = {
    pagination: Pagination;
    handlePageChange: (page: number) => void;
}

export default function PaginationComponent({ pagination, handlePageChange }: PaginationProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
                Halaman {pagination.current_page} dari {pagination.total_pages}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.total_pages}
                >
                    Selanjutnya
                </Button>
            </div>
        </div>
    );
}
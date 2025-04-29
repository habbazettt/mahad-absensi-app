import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type CategoryFilterProps = {
    selectedCategory?: string | null;
    handleCategoryFilter: (category: string) => void;
};

export default function CategoryFilter({ selectedCategory, handleCategoryFilter }: CategoryFilterProps) {
    return (
        <div className="w-full sm:w-[300px]">
            <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedCategory || "Filter Kategori"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="ziyadah">Ziyadah</SelectItem>
                    <SelectItem value="murojaah">Murojaah</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Mahasantri } from "@/types";

type MahasantriFilterProps = {
    mahasantriData: Mahasantri[];
    handleMahasantriFilter: (e: string) => void;
    selectedMahasantriId?: string | null
}

export default function MahasantriFilter({ mahasantriData, handleMahasantriFilter, selectedMahasantriId }: MahasantriFilterProps) {
    const selectedMahasantri = mahasantriData.find(mahasantri => mahasantri.id === parseInt(selectedMahasantriId || '')) || null;

    return (
        <div className="w-full sm:w-[300px]">
            <Select onValueChange={(e) => handleMahasantriFilter(e)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedMahasantri ? selectedMahasantri.nama : "Filter Mahasantri"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Mahasantri</SelectItem>
                    {mahasantriData.map((mahasantri) => (
                        <SelectItem
                            key={mahasantri.id}
                            value={String(mahasantri.id)}
                        >
                            {mahasantri.nama}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
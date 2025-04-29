import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type TimeFilterProps = {
    selectedTime?: string | null;
    handleTimeFilter: (time: string) => void;
};

export default function TimeFilter({ selectedTime, handleTimeFilter }: TimeFilterProps) {
    return (
        <div className="w-full sm:w-[300px]">
            <Select onValueChange={handleTimeFilter}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedTime || "Filter Waktu"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Waktu</SelectItem>
                    <SelectItem value="shubuh">Shubuh</SelectItem>
                    <SelectItem value="isya">Isya</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
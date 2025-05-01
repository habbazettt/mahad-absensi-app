import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type DateFilterProps = {
    selectedMonth: string;
    selectedYear: string;
    handleMonthChange: (month: string) => void;
    handleYearChange: (year: string) => void;
};

const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const years = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

export default function DateFilter({ selectedMonth, selectedYear, handleMonthChange, handleYearChange }: DateFilterProps) {
    return (
        <div className="flex gap-4">
            {/* Dropdown untuk Bulan */}
            <Select onValueChange={handleMonthChange} value={selectedMonth}>
                <SelectTrigger className="border rounded p-2 w-full">
                    <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                            {month.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Dropdown untuk Tahun */}
            <Select onValueChange={handleYearChange} value={selectedYear}>
                <SelectTrigger className="border rounded p-2 w-full">
                    <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
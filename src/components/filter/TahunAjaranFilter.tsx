import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useState } from "react";
import { TargetSemester } from "@/types";

interface ApiResponse {
    status: boolean;
    message: string;
    data: {
        pagination: {
            current_page: number;
            total_data: number;
            total_pages: number;
        };
        target_semesters: TargetSemester[];
    };
}

type TahunAjaranFilterProps = {
    selectedTahunAjaran?: string | null;
    handleTahunAjaranFilter: (category: string) => void;
};

export default function TahunAjaranFilter({ selectedTahunAjaran, handleTahunAjaranFilter }: TahunAjaranFilterProps) {
    const [tahunAjaran, setTahunAjaran] = useState<string[]>([]);

    useEffect(() => {
        fetchTargetSemesterData();
    }, []);

    const fetchTargetSemesterData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/target_semester`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            if (!response.ok) throw new Error("Gagal mengambil data target semester");
            const data: ApiResponse = await response.json();
            if (data.status) {
                const uniqueTahunAjaran = Array.from(
                    new Set(data.data.target_semesters.map((item) => item.tahun_ajaran))
                );
                setTahunAjaran(uniqueTahunAjaran);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    return (
        <div className="w-full sm:w-[300px]">
            <Select onValueChange={handleTahunAjaranFilter}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedTahunAjaran || "Filter Tahun Ajaran"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                    {tahunAjaran.map((tahun) => (
                        <SelectItem key={tahun} value={tahun}>
                            {tahun}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
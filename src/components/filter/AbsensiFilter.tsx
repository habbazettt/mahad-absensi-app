import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface AbsensiFilterProps {
    selectedWaktu: string | undefined;
    handleWaktuFilter: (waktu: string) => void;
    selectedStatus: string | undefined;
    handleStatusFilter: (status: string) => void;
}

const AbsensiFilter: React.FC<AbsensiFilterProps> = ({ selectedWaktu, handleWaktuFilter, selectedStatus, handleStatusFilter }) => {
    return (
        <div className="flex flex-wrap gap-4">
            {/* Filter Waktu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="sm:w-auto">
                        Waktu
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                        checked={selectedWaktu === "shubuh"}
                        onCheckedChange={() => handleWaktuFilter(selectedWaktu === "shubuh" ? "all" : "shubuh")}
                    >
                        Shubuh
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={selectedWaktu === "isya"}
                        onCheckedChange={() => handleWaktuFilter(selectedWaktu === "isya" ? "all" : "isya")}
                    >
                        Isya
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={selectedWaktu === undefined}
                        onCheckedChange={() => handleWaktuFilter("all")}
                    >
                        Semua
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Status */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="sm:w-auto">
                        Status
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                        checked={selectedStatus === "hadir"}
                        onCheckedChange={() => handleStatusFilter(selectedStatus === "hadir" ? "all" : "hadir")}
                    >
                        Hadir
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={selectedStatus === "izin"}
                        onCheckedChange={() => handleStatusFilter(selectedStatus === "izin" ? "all" : "izin")}
                    >
                        Izin
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={selectedStatus === "absen"}
                        onCheckedChange={() => handleStatusFilter(selectedStatus === "absen" ? "all" : "absen")}
                    >
                        Absen
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={selectedStatus === undefined}
                        onCheckedChange={() => handleStatusFilter("all")}
                    >
                        Semua
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default AbsensiFilter;
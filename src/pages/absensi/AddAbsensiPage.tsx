import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mahasantri, Mentor } from "@/types";
import { format } from 'date-fns';
import { Datepicker } from 'flowbite-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToasterLayout from "@/components/ToasterLayout";

const absensiFormSchema = z.object({
    mentor_id: z.number(),
    tanggal: z.string(),
    waktu: z.string(),
    mahasantriStatus: z.array(
        z.object({
            mahasantri_id: z.number(),
            status: z.string(),
        })
    )
});

type AbsensiFormValues = z.infer<typeof absensiFormSchema>;

export default function AddAbsensiPage() {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mahasantris, setMahasantris] = useState<Mahasantri[]>([]);
    const [filteredMahasantris, setFilteredMahasantris] = useState<Mahasantri[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
    const [mahasantriStatusList, setMahasantriStatusList] = useState<Array<{ mahasantri_id: number, status: string }>>([]);

    const form = useForm<AbsensiFormValues>({
        resolver: zodResolver(absensiFormSchema),
        defaultValues: {
            mahasantriStatus: []
        }
    });

    useEffect(() => {
        const fetchMentors = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/mentors?page=1&limit=16`);
                if (!response.ok) throw new Error("Failed to fetch mentors");
                const data = await response.json();
                setMentors(data.data.mentors);
            } catch (error) {
                console.error("Error fetching mentors:", error);
                toast.error("Gagal mengambil data mentor");
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch Mahasantri Data
        const fetchMahasantriData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/mahasantri`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch mahasantri data");
                const data = await response.json();

                if (Array.isArray(data.data.mahasantri)) {
                    setMahasantris(data.data.mahasantri);
                } else {
                    console.error("Data mahasantri tidak dalam format array:", data.data.mahasantri);
                    toast.error("Data mahasantri tidak valid");
                }
            } catch (error) {
                console.error("Error fetching mahasantri data:", error);
                toast.error("Gagal mengambil data mahasantri");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentors();
        fetchMahasantriData();
    }, []);

    // Handle mentor selection
    const handleMentorChange = (mentorId: number) => {
        setSelectedMentorId(mentorId);
        form.setValue("mentor_id", mentorId);

        // Filter mahasantris by selected mentor
        if (mentorId) {
            const filtered = mahasantris.filter(mahasantri => mahasantri.mentor_id === mentorId);
            setFilteredMahasantris(filtered);

            // Initialize status for each mahasantri as empty
            const initialStatusList = filtered.map(m => ({
                mahasantri_id: m.id,
                status: ""
            }));

            setMahasantriStatusList(initialStatusList);
            form.setValue("mahasantriStatus", initialStatusList);
        } else {
            setFilteredMahasantris([]);
            setMahasantriStatusList([]);
            form.setValue("mahasantriStatus", []);
        }
    };

    // Handle date selection
    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
            const formattedDate = format(date, 'dd-MM-yyyy');
            form.setValue("tanggal", formattedDate);
        }
    };

    // Handle status change for a mahasantri
    const handleStatusChange = (mahasantriId: number, status: string) => {
        const updatedList = mahasantriStatusList.map(item => {
            if (item.mahasantri_id === mahasantriId) {
                return { ...item, status };
            }
            return item;
        });

        setMahasantriStatusList(updatedList);
        form.setValue("mahasantriStatus", updatedList);
    };

    // Set all mahasantris to the same status
    const setAllStatus = (status: string) => {
        const updatedList = mahasantriStatusList.map(item => ({
            ...item,
            status
        }));

        setMahasantriStatusList(updatedList);
        form.setValue("mahasantriStatus", updatedList);
    };

    const onSubmit = async (data: AbsensiFormValues) => {
        // Validate required fields first
        if (!data.mentor_id) {
            toast.error("Mohon pilih mentor terlebih dahulu");
            return;
        }

        if (!data.tanggal) {
            toast.error("Mohon pilih tanggal absensi");
            return;
        }

        if (!data.waktu) {
            toast.error("Mohon pilih waktu absensi (Shubuh/Isya)");
            return;
        }

        if (filteredMahasantris.length === 0) {
            toast.error("Tidak ada mahasantri untuk mentor yang dipilih");
            return;
        }

        // Validate if any mahasantri has no status selected
        const emptyStatusMahasantris = data.mahasantriStatus.filter(item => !item.status);
        if (emptyStatusMahasantris.length > 0) {
            const mahasantriWithoutStatus = emptyStatusMahasantris.map(item => {
                const mahasantri = filteredMahasantris.find(m => m.id === item.mahasantri_id);
                return mahasantri?.nama || `ID: ${item.mahasantri_id}`;
            });

            if (emptyStatusMahasantris.length === 1) {
                toast.error(`Mohon isi status untuk mahasantri: ${mahasantriWithoutStatus[0]}`);
            } else if (emptyStatusMahasantris.length <= 3) {
                toast.error(`Mohon isi status untuk mahasantri: ${mahasantriWithoutStatus.join(', ')}`);
            } else {
                toast.error(`Mohon isi status untuk ${emptyStatusMahasantris.length} mahasantri yang belum terisi`);
            }
            return;
        }

        setIsLoading(true);
        try {
            // Create array of request objects
            const requestBodies = data.mahasantriStatus.map(item => ({
                mahasantri_id: item.mahasantri_id,
                mentor_id: data.mentor_id,
                waktu: data.waktu,
                status: item.status,
                tanggal: data.tanggal,
            }));

            const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBodies),
            });

            if (!response.ok) {
                // Try to parse error message from response
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        if (errorData.message.includes("duplicate") || errorData.message.includes("exists")) {
                            throw new Error("Data absensi untuk tanggal dan waktu yang sama sudah ada");
                        } else {
                            throw new Error(errorData.message);
                        }
                    } else if (response.status === 409) {
                        throw new Error("Data absensi untuk tanggal dan waktu yang sama sudah ada");
                    } else if (response.status === 401) {
                        throw new Error("Sesi login Anda telah berakhir. Silakan login kembali");
                    } else if (response.status === 403) {
                        throw new Error("Anda tidak memiliki izin untuk menambahkan absensi");
                    } else {
                        throw new Error(`Gagal menambahkan absensi. Status: ${response.status}`);
                    }
                } catch (parseError) {
                    if (parseError instanceof Error) {
                        throw parseError;
                    } else {
                        throw new Error(`Gagal menambahkan absensi. Status: ${response.status}`);
                    }
                }
            }

            toast.success("Absensi berhasil ditambahkan");
            navigate("/dashboard/absensi");
        } catch (error) {
            console.error("Error adding absensi:", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Gagal menambahkan absensi. Silakan coba lagi");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <ToasterLayout />
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 font-jakarta">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-muted-foreground">Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-muted-foreground">Absensi Halaqoh</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Input Absensi</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Input Absensi Mahasantri</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Dropdown Mentor */}
                                        <FormField
                                            control={form.control}
                                            name="mentor_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-gray-700">Pilih Mentor</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value ? String(field.value) : ""}
                                                            onValueChange={(value) => handleMentorChange(Number(value))}
                                                            disabled={isLoading}
                                                        >
                                                            <SelectTrigger className="w-full font-poppins">
                                                                <SelectValue placeholder="Pilih Mentor" />
                                                            </SelectTrigger>
                                                            <SelectContent className="font-poppins">
                                                                {mentors.map((mentor) => (
                                                                    <SelectItem key={mentor.id} value={String(mentor.id)}>
                                                                        {mentor.gender === "L" ? "Ust. " : "Usth. "}
                                                                        {mentor.nama}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Input Tanggal */}
                                        <FormField
                                            control={form.control}
                                            name="tanggal"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-gray-700">Tanggal</FormLabel>
                                                    <FormControl>
                                                        <Datepicker
                                                            value={selectedDate}
                                                            id="tanggal"
                                                            className="w-full font-poppins"
                                                            placeholder="Pilih Tanggal"
                                                            showTodayButton
                                                            labelTodayButton="Hari Ini"
                                                            showClearButton
                                                            labelClearButton="Bersihkan"
                                                            language="id"
                                                            autoHide
                                                            onChange={handleDateChange}
                                                            maxDate={new Date()}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Input Waktu */}
                                        <FormField
                                            control={form.control}
                                            name="waktu"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-gray-700">Waktu</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <SelectTrigger className="w-full font-poppins">
                                                                <SelectValue placeholder="Pilih Waktu" />
                                                            </SelectTrigger>
                                                            <SelectContent className="font-poppins">
                                                                <SelectItem value="shubuh">Shubuh</SelectItem>
                                                                <SelectItem value="isya">Isya</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Mahasantri Table */}
                                    {filteredMahasantris.length > 0 && (
                                        <div className="mt-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                                <h3 className="font-bold text-gray-700">Daftar Mahasantri</h3>
                                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAllStatus("hadir")}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        Semua Hadir
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAllStatus("izin")}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        Semua Izin
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAllStatus("alpa")}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        Semua Alpa
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="border rounded-md overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-12 text-center">No</TableHead>
                                                            <TableHead>Nama Mahasantri</TableHead>
                                                            <TableHead>Status Kehadiran</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredMahasantris.map((mahasantri, index) => {
                                                            const statusData = mahasantriStatusList.find(item =>
                                                                item.mahasantri_id === mahasantri.id
                                                            );

                                                            return (
                                                                <TableRow key={mahasantri.id}>
                                                                    <TableCell className="text-center">{index + 1}</TableCell>
                                                                    <TableCell className="font-medium">{mahasantri.nama}</TableCell>
                                                                    <TableCell>
                                                                        <Select
                                                                            value={statusData?.status || ""}
                                                                            onValueChange={(value) => handleStatusChange(mahasantri.id, value)}
                                                                        >
                                                                            <SelectTrigger className="w-full font-poppins">
                                                                                <SelectValue placeholder="Pilih Status" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="font-poppins">
                                                                                <SelectItem value="hadir">Hadir</SelectItem>
                                                                                <SelectItem value="izin">Izin</SelectItem>
                                                                                <SelectItem value="alpa">Alpa</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}

                                    {selectedMentorId && filteredMahasantris.length === 0 && (
                                        <div className="mt-6 text-center text-gray-500 py-4 border rounded-md">
                                            Tidak ada mahasantri untuk mentor ini
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white cursor-pointer py-2 px-4 rounded-md transition duration-300 ease-in-out transform ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Loading..." : "Simpan Absensi"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
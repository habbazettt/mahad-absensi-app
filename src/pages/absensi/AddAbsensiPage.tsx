/* eslint-disable react-hooks/exhaustive-deps */
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
import toast, { Toaster } from "react-hot-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mahasantri, Mentor } from "@/types";
import { format } from 'date-fns';
import { Datepicker } from 'flowbite-react'

const addAbsensiSchema = z.object({
    mahasantri_id: z.number(),
    mentor_id: z.number(),
    waktu: z.string(),
    status: z.string(),
    tanggal: z.string(),
});

type AddFormValues = z.infer<typeof addAbsensiSchema>;

export default function AddAbsensiPage() {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mahasantris, setMahasantris] = useState<Mahasantri[]>([]);
    const [filteredMahasantris, setFilteredMahasantris] = useState<Mahasantri[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const form = useForm<AddFormValues>({
        resolver: zodResolver(addAbsensiSchema),
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

                // Akses data.data.mahasantri
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

    // Update filtered mahasantris when mentor_id changes
    useEffect(() => {
        const selectedMentorId = form.watch("mentor_id");
        if (selectedMentorId) {
            const filtered = mahasantris.filter(mahasantri => mahasantri.mentor_id === selectedMentorId);
            setFilteredMahasantris(filtered);
        } else {
            setFilteredMahasantris([]);
        }
    }, [form.watch("mentor_id"), mahasantris]);

    const onSubmit = async (data: AddFormValues) => {
        setIsLoading(true);
        try {
            const requestBody = {
                mahasantri_id: data.mahasantri_id,
                mentor_id: data.mentor_id,
                waktu: data.waktu,
                status: data.status,
                tanggal: data.tanggal,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("Failed to add absensi");
            toast.success("Absensi berhasil ditambahkan");
            navigate("/dashboard/absensi");
        } catch (error) {
            console.error("Error adding absensi:", error);
            toast.error("Gagal menambahkan absensi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <Toaster position="top-right" />
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

                <div className="flex flex-1 flex-col gap-6 p-8 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Input Absensi Mahasantri</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                onValueChange={(value) => field.onChange(Number(value))}
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

                            {/* Dropdown Mahasantri berdasarkan Mentor */}
                            <FormField
                                control={form.control}
                                name="mahasantri_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Pilih Mahasantri</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={isLoading || filteredMahasantris.length === 0}
                                            >
                                                <SelectTrigger className="w-full font-poppins">
                                                    <SelectValue placeholder="Pilih Mahasantri" />
                                                </SelectTrigger>
                                                <SelectContent className="font-poppins">
                                                    {filteredMahasantris.map((mahasantri) => (
                                                        <SelectItem key={mahasantri.id} value={String(mahasantri.id)}>
                                                            {mahasantri.nama}
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
                                        <FormDescription>Masukkan tanggal halaqoh</FormDescription>
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
                                                onChange={(date) => {
                                                    if (date) {
                                                        setSelectedDate(date);
                                                        const formattedDate = format(date, 'dd-MM-yyyy');
                                                        form.setValue("tanggal", formattedDate);
                                                    }
                                                }}
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
                                        <FormDescription>Masukkan waktu halaqoh (Shubuh / Isya)</FormDescription>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
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

                            {/* Input Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Status Kehadiran</FormLabel>
                                        <FormDescription>Masukkan status kehadiran halaqoh (Hadir / Izin / Absen)</FormDescription>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-full font-poppins">
                                                    <SelectValue placeholder="Pilih Status" />
                                                </SelectTrigger>
                                                <SelectContent className="font-poppins">
                                                    <SelectItem value="hadir">Hadir</SelectItem>
                                                    <SelectItem value="izin">Izin</SelectItem>
                                                    <SelectItem value="absen">Absen</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button
                                className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white cursor-pointer py-2 px-4 rounded-md transition duration-300 ease-in-out transform ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Tambah Setoran"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

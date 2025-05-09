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
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mahasantri, Mentor } from "@/types";
import ToasterLayout from "@/components/ToasterLayout";

const addTargetSemesterSchema = z.object({
    mentor_id: z.number(),
    mahasantri_id: z.number(),
    semester: z.string(),
    tahun_ajaran: z.string(),
    target: z.number(),
    keterangan: z.string().optional(),
});

type AddFormValues = z.infer<typeof addTargetSemesterSchema>;

export default function AddTargetPage() {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mahasantris, setMahasantris] = useState<Mahasantri[]>([]);
    const [filteredMahasantris, setFilteredMahasantris] = useState<Mahasantri[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AddFormValues>({
        resolver: zodResolver(addTargetSemesterSchema),
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
                semester: data.semester,
                tahun_ajaran: data.tahun_ajaran,
                target: data.target,
                keterangan: data.keterangan,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/target_semester`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("Failed to add setoran");
            toast.success("Setoran berhasil ditambahkan");
            navigate(`/dashboard/info-mahasantri/detail/${data.mahasantri_id}`);
        } catch (error) {
            console.error("Error adding setoran:", error);
            toast.error("Gagal menambahkan setoran");
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
                                    <BreadcrumbPage className="text-muted-foreground">Target Semester</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Input Target</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-8 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Input Target Semester Mahasantri</h2>
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

                            {/* Input Semester */}
                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Semester</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-full font-poppins">
                                                    <SelectValue placeholder="Pilih Semester" />
                                                </SelectTrigger>
                                                <SelectContent className="font-poppins">
                                                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                                                    <SelectItem value="Genap">Genap</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Tahun Ajaran */}
                            <FormField
                                control={form.control}
                                name="tahun_ajaran"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Tahun Ajaran</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Masukkan Tahun Ajaran (ex: 2024/2025)"
                                                {...field}
                                                className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Target */}
                            <FormField
                                control={form.control}
                                name="target"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Target</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Masukkan Target"
                                                {...field}
                                                className="no-spinner border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? Number(value) : 0);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Keterangan */}
                            <FormField
                                control={form.control}
                                name="keterangan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Keterangan</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Masukkan Ketarangan"
                                                {...field}
                                                className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button
                                className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded-md transition duration-300 ease-in-out transform ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Tambah Target Semester"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

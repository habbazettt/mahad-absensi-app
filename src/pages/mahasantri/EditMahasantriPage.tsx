/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import toast, { Toaster } from "react-hot-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mentor } from "@/types";

const editMahasantriSchema = z.object({
    nama: z.string().optional(),
    nim: z.string().min(10).optional(),
    jurusan: z.string().optional(),
    mentor_id: z.number().optional(),
});

type EditFormValues = z.infer<typeof editMahasantriSchema>;

export default function EditMahasantriPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editMahasantriSchema),
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

        const fetchMahasantriData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/mahasantri/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                }
                );
                if (!response.ok) throw new Error("Failed to fetch mahasantri data");
                const data = await response.json();
                form.reset(data.data);
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

    const onSubmit = async (values: EditFormValues) => {
        const requestBody = {
            ...values,
            mentor_id: Number(values.mentor_id),
        };

        const loadingToast = toast.loading("Sedang memproses...");

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mahasantri/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Update failed");
            }

            toast.dismiss(loadingToast);

            toast.success("Data mahasantri berhasil diperbarui!");
            setTimeout(() => {
                navigate("/dashboard/info-mahasantri");
            }, 200);

        } catch (error) {
            console.error("Update error:", error);
            toast.error("Data mahasantri gagal diperbarui!");
        } finally {
            setIsLoading(false)
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
                                    <BreadcrumbPage className="text-muted-foreground">Data Mahasantri</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Edit Mahasantri</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-8 pt-4 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Edit Data Mahasantri</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* NAMA */}
                            <FormField
                                control={form.control}
                                name="nama"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Nama Lengkap</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                                placeholder="Masukkan Nama Lengkap Anda"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* NIM */}
                            <FormField
                                control={form.control}
                                name="nim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Nomor Induk Mahasiswa (NIM)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                                placeholder="Masukkan NIM Anda"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Jurusan */}
                            <FormField
                                control={form.control}
                                name="jurusan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Jurusan Mahasiswa</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                                placeholder="Masukkan Jurusan Anda"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dropdown Mentor */}
                            <FormField
                                control={form.control}
                                name="mentor_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilih Mentor</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={String(field.value)}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Mentor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mentors.map((mentor) => (
                                                        <SelectItem key={mentor.id} value={String(mentor.id)}>
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

                            <Button
                                className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Perbarui Data"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

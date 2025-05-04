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

const editMentorSchema = z.object({
    nama: z.string().optional(),
    email: z.string().email().optional(),
    gender: z.string().optional(),
});

type EditFormValues = z.infer<typeof editMentorSchema>;


export default function EditMentorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editMentorSchema),
        defaultValues: {
            nama: "",
            email: "",
            gender: "",
        },
    });

    useEffect(() => {
        const fetchMentorData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/mentors/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                }
                );
                if (!response.ok) throw new Error("Failed to fetch mentor data");
                const data = await response.json();
                form.reset(data.data);
            } catch (error) {
                console.error("Error fetching mentor data:", error);
                toast.error("Gagal mengambil data mentor");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentorData()
    }, []);

    const onSubmit = async (values: EditFormValues) => {
        const loadingToast = toast.loading("Sedang memproses...");
        setIsLoading(true);

        // Ambil data pengguna saat ini dari localStorage
        const currentUserData = JSON.parse(localStorage.getItem("user") || '{}');

        // Periksa apakah ada perubahan data
        const isDataChanged = JSON.stringify(currentUserData) !== JSON.stringify(values);

        if (!isDataChanged) {
            // Jika tidak ada perubahan, tampilkan pesan sukses dan navigasi
            toast.dismiss(loadingToast);
            toast.success("Data Mentor tidak berubah, tetap sukses!");
            navigate("/dashboard");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mentors/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed");
            }

            const data = await response.json();

            toast.dismiss(loadingToast);

            toast.success("Data Mentor berhasil diperbarui!, Silahkan Login Kembali");

            localStorage.removeItem("user");

            localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
            console.error("error", error);
            toast.dismiss(loadingToast);
            toast.error("Data Mentor gagal diperbarui!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        maxWidth: '500px',
                        padding: '12px 16px',
                    },
                    success: {
                        style: {
                            border: '1px solid #10B981',
                            backgroundColor: '#ECFDF5',
                            color: '#065F46',
                        },
                    },
                    error: {
                        style: {
                            border: '1px solid #EF4444',
                            backgroundColor: '#FEF2F2',
                            color: '#991B1B',
                        },
                    },
                }}
            />
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
                                    <BreadcrumbPage className="text-primary">Edit Mentor</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-8 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Edit Data Mentor</h2>
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

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-1)]"
                                                placeholder="Masukkan Email Anda"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dropdown Gender */}
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilih Gender</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={String(field.value)}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="L">Laki-laki</SelectItem>
                                                    <SelectItem value="P">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded-md transition duration-300 ease-in-out transform ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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

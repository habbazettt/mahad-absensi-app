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

const editSetoranSchema = z.object({
    juz: z.number().optional(),
    halaman: z.string().optional(),
    total_setoran: z.number().optional(),
    kategori: z.string().optional(),
    waktu: z.string().optional(),
    catatan: z.string().optional()
});

type EditFormValues = z.infer<typeof editSetoranSchema>;

export default function EditSetoranPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editSetoranSchema),
    });

    useEffect(() => {
        const fetchSetoranData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/hafalan/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch setoran data");
                const data = await response.json();
                form.reset(data.data);
            } catch (error) {
                console.error("Error fetching setoran data:", error);
                toast.error("Gagal mengambil data setoran");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSetoranData();
    }, [id]);

    const onSubmit = async (data: EditFormValues) => {
        setIsLoading(true);
        try {
            const requestBody = {
                juz: Number(data.juz),
                halaman: data.halaman,
                total_setoran: Number(data.total_setoran),
                kategori: data.kategori,
                waktu: data.waktu,
                catatan: data.catatan
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/hafalan/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("Failed to update setoran");
            toast.success("Setoran berhasil diperbarui");
            setTimeout(() => {
                navigate("/dashboard/setoran");
            }, 400)
        } catch (error) {
            console.error("Error updating setoran:", error);
            toast.error("Gagal memperbarui setoran");
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
                                    <BreadcrumbPage className="text-muted-foreground">Setoran Mahasantri</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Edit Setoran</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-8 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Edit Setoran</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Input Juz */}
                            <FormField
                                control={form.control}
                                name="juz"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Juz</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Masukkan Juz"
                                                {...field}
                                                className="no-spinner"
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

                            {/* Input Halaman */}
                            <FormField
                                control={form.control}
                                name="halaman"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Halaman</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Masukkan Halaman"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Total Setoran */}
                            <FormField
                                control={form.control}
                                name="total_setoran"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Setoran</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Masukkan Total Setoran"
                                                {...field}
                                                className="no-spinner"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? Number(value) : 0); // Konversi ke number
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Kategori */}
                            <FormField
                                control={form.control}
                                name="kategori"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ziyadah">Ziyadah</SelectItem>
                                                    <SelectItem value="murojaah">Murojaah</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                        <FormLabel>Waktu</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Waktu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="shubuh">Shubuh</SelectItem>
                                                    <SelectItem value="isya">Isya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Catatan */}
                            <FormField
                                control={form.control}
                                name="catatan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Catatan</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Masukkan Catatan"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button
                                className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Edit Setoran"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

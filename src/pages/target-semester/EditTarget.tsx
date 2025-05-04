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

const editTargetSemesterSchema = z.object({
    semester: z.string().optional(),
    tahun_ajaran: z.string().optional(),
    target: z.number().optional(),
    keterangan: z.string().optional(),
});

type EditFormValues = z.infer<typeof editTargetSemesterSchema>;

export default function EditTargetPage() {
    const { id } = useParams()
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editTargetSemesterSchema),
    });

    useEffect(() => {
        const fetchTargetSemesterData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/target_semester/${id}`, {
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
        fetchTargetSemesterData();
    }, [id]);


    const onSubmit = async (data: EditFormValues) => {
        setIsLoading(true);
        try {
            const requestBody = {
                semester: data.semester,
                tahun_ajaran: data.tahun_ajaran,
                target: data.target,
                keterangan: data.keterangan,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/target_semester/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("Failed to update target semester");
            toast.success("Target Semester berhasil diperbarui");
            navigate(`/dashboard/info-mahasantri`);
        } catch (error) {
            console.error("Error updating target semester:", error);
            toast.error("Gagal memperbarui target semester");
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
                                    <BreadcrumbPage className="text-muted-foreground">Target Semester</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Edit Target Semester</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-8 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Input Target Semester Mahasantri</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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

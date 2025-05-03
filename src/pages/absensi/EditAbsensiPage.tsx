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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import toast, { Toaster } from "react-hot-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Datepicker } from "flowbite-react";
import { format } from "date-fns";

const editAbsensiSchema = z.object({
    waktu: z.string().optional(),
    status: z.string().optional(),
    tanggal: z.string().optional(),
});

type EditFormValues = z.infer<typeof editAbsensiSchema>;

export default function EditAbsensiPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editAbsensiSchema),
    });

    useEffect(() => {
        const fetchAbsensiData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch absensi data");
                const data = await response.json();
                form.reset(data.data.absensi);

                const fetchedDate = new Date(data.data.absensi.tanggal);
                setSelectedDate(fetchedDate);
            } catch (error) {
                console.error("Error fetching absensi data:", error);
                toast.error("Gagal mengambil data absensi");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAbsensiData();
    }, [id]);

    const onSubmit = async (data: EditFormValues) => {
        setIsLoading(true);
        try {
            const requestBody = {
                status: data.status,
                waktu: data.waktu,
                tanggal: data.tanggal,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/absensi/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("Failed to update absensi");
            toast.success("Absensi berhasil diperbarui");
            setTimeout(() => {
                navigate("/dashboard/absensi/detail");
            }, 400)
        } catch (error) {
            console.error("Error updating absensi:", error);
            toast.error("Gagal memperbarui absensi");
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
                                    <BreadcrumbPage className="text-muted-foreground">Detail Absensi</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Edit Absensi</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-8 bg-gray-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Edit Absensi</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        <FormDescription>Masukkan status kehadiran halaqoh (Hadir / Izin / Alpa)</FormDescription>
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
                                                    <SelectItem value="alpa">Alpa</SelectItem>
                                                </SelectContent>
                                            </Select>
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

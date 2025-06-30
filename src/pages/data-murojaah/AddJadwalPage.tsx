import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
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
import toast from "react-hot-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ToasterLayout from "@/components/ToasterLayout";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Footer from "@/components/Footer";

const addJadwalSchema = z.object({
    total_hafalan: z.coerce
        .number({ invalid_type_error: "Total hafalan harus berupa angka" })
        .min(1, "Hafalan minimal 1 Juz")
        .max(30, "Hafalan maksimal 30 Juz"),
    jadwal: z.string().min(1, "Jadwal tidak boleh kosong"),
    kesibukan: z.string().min(1, "Kesibukan tidak boleh kosong"),
    efektifitas_jadwal: z.string().min(1, "Anda harus memilih tingkat efektivitas"),
});

type AddFormValues = z.infer<typeof addJadwalSchema>;

export default function AddJadwalPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { updateUser } = useAuth();

    const form = useForm<AddFormValues>({
        resolver: zodResolver(addJadwalSchema),
        defaultValues: {
            jadwal: "",
            kesibukan: "",
            efektifitas_jadwal: "3",
            total_hafalan: 1,
        },
    });

    const onSubmit = async (data: AddFormValues) => {
        setIsLoading(true);
        const toastId = toast.loading("Menyimpan data...");

        try {
            // Ambil data user dari localStorage
            const userString = localStorage.getItem("user");
            if (!userString) {
                throw new Error("Data user tidak ditemukan. Silakan login kembali.");
            }

            const user = JSON.parse(userString);

            // Tentukan field yang tepat berdasarkan user_type
            const userIdField = user.user_type === "mahasantri"
                ? { mahasantri_id: user.id }
                : { mentor_id: user.id };

            const requestBody = {
                total_hafalan: data.total_hafalan,
                jadwal: data.jadwal.toLowerCase().replace("'", ""),
                kesibukan: data.kesibukan.toLowerCase(),
                efektifitas_jadwal: parseInt(data.efektifitas_jadwal, 10),
                ...userIdField, // Spread operator untuk menambahkan mahasantri_id atau mentor_id
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/jadwal-personal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || "Gagal menyimpan data jadwal");
            }

            toast.success("Data berhasil disimpan!", { id: toastId });

            try {
                const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    updateUser(profileData.data);
                }
            } catch (profileError) {
                console.error("Gagal memperbarui profil pengguna:", profileError);
            }

            navigate("/dashboard/ai-rekomendasi");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
            toast.error(errorMessage, { id: toastId });
            console.error("Error saat menyimpan jadwal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                                        <BreadcrumbPage className="text-muted-foreground">AI Rekomendasi</BreadcrumbPage>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-primary">Input Jadwal</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 bg-gray-50 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-800 text-center">Input Data Profil Muroja'ah</h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                {/* Input Juz */}
                                <FormField
                                    control={form.control}
                                    name="total_hafalan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Total Hafalan (Juz)</FormLabel>
                                            <FormDescription>Masukkan jumlah hafalan Anda saat ini (angka 1-30).</FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Contoh: 15"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : e.target.value)}
                                                    className="no-spinner"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Input Kesibukan */}
                                <FormField
                                    control={form.control}
                                    name="kesibukan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Kesibukan Utama</FormLabel>
                                            <FormDescription>Pilih atau masukkan kesibukan Anda (contoh: Kuliah + Organisasi).</FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Contoh: Kuliah + Organisasi"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Input Jadwal Muroja'ah */}
                                <FormField
                                    control={form.control}
                                    name="jadwal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Jadwal Muroja'ah yang Biasa Digunakan</FormLabel>
                                            <FormDescription>Pisahkan dengan koma jika lebih dari satu (contoh: Ba'da Shubuh, Ba'da Isya).</FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Contoh: Ba'da Shubuh, Ba'da Isya"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Radio Button Untuk Efektifitas Jadwal */}
                                <FormField
                                    control={form.control}
                                    name="efektifitas_jadwal"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="font-bold">Tingkat Efektivitas Jadwal</FormLabel>
                                            <FormDescription>Seberapa efektif kombinasi jadwal dan kesibukan Anda di atas?</FormDescription>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                        {/* Opsi 1 sampai 5 */}
                                                        {[1, 2, 3, 4, 5].map((value) => (
                                                            <FormItem key={value} className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value={String(value)} />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{value}</FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormDescription className="flex justify-between px-2">
                                                <span>Sangat Tidak Efektif</span>
                                                <span>Sangat Efektif</span>
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tombol Submit */}
                                <Button
                                    className={`w-full bg-[#2E649C] hover:bg-[#2E649C]/90 text-white py-3 px-4 rounded-lg transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan Data Muroja'ah"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <Footer />
        </>
    )
}
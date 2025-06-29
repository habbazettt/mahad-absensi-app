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
import ToasterLayout from "@/components/ToasterLayout";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Key, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecommendationResult } from "@/types";
import Footer from "@/components/Footer";

const getRecommendationSchema = z.object({
    jumlah_hafalan: z.number(),
    kesibukan: z.string(),
    kesibukan_lainnya: z.string().optional(),
});

type GetFormValues = z.infer<typeof getRecommendationSchema>;

export default function RekomendasiPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [kesibukanList, setKesibukanList] = useState([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null)

    const form = useForm<GetFormValues>({
        resolver: zodResolver(getRecommendationSchema),
    });

    const kesibukanValue = form.watch("kesibukan");

    const user = JSON.parse(localStorage.getItem("user") ?? '{}');

    useEffect(() => {
        if (!user) {
            navigate("/auth/login");
            return;
        } else {
            if (user.is_data_murojaah_filled === false) {
                navigate("/dashboard/data-murojaah/add");
                return
            }
        }
    }, [])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/rekomendasi/kesibukan`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setKesibukanList(data.data);
            })
            .catch((error) => {
                console.error("Error fetching kesibukan list:", error);
            });
    }, []);

    useEffect(() => {
        if (kesibukanValue === "lainnya") {
            setShowCustomInput(true);
        } else {
            setShowCustomInput(false);
            form.setValue("kesibukan_lainnya", "");
        }
    }, [kesibukanValue, form]);

    const getKategoriHafalan = (jumlahHafalan: number): string => {
        if (jumlahHafalan >= 1 && jumlahHafalan <= 10) {
            return "1-10 Juz";
        } else if (jumlahHafalan >= 11 && jumlahHafalan <= 20) {
            return "11-20 Juz";
        } else if (jumlahHafalan >= 21 && jumlahHafalan <= 30) {
            return "21-30 Juz";
        }
        return "1-10 Juz";
    };

    const onSubmit = async (data: GetFormValues) => {
        setIsLoading(true);
        try {
            const finalKesibukan = data.kesibukan === "lainnya"
                ? data.kesibukan_lainnya?.toLowerCase()
                : data.kesibukan;

            const jumlahHafalanNumber = data.jumlah_hafalan;
            const kategoriHafalan = getKategoriHafalan(jumlahHafalanNumber);

            const requestBody = {
                kesibukan: finalKesibukan,
                kategori_hafalan: kategoriHafalan
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/rekomendasi`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            if (!response.ok) throw new Error("Failed to get recommendation");

            setRecommendationResult(result.data);
            setShowResultModal(true);
            toast.success("Berhasil mendapatkan rekomendasi");
        } catch (error) {
            console.error("Error get recommendation:", error);
            toast.error("Gagal mendapatkan rekomendasi");
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
                                        <BreadcrumbPage className="text-primary">AI Rekomendasi</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>

                    {/* Modern Background with Gradient */}
                    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
                        <div className="max-w-2xl mx-auto">
                            {/* Hero Section */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#2E649C] to-indigo-600 rounded-2xl mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2E649C] to-indigo-600 bg-clip-text text-transparent mb-4">
                                    AI Rekomendasi Jadwal
                                </h1>
                                <p className="text-xl text-slate-600 mb-2">Muroja'ah yang Disesuaikan</p>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Dapatkan jadwal muroja'ah yang dipersonalisasi berdasarkan jumlah hafalan dan kesibukan Anda
                                </p>
                            </div>

                            {/* Modern Form Card */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full translate-y-12 -translate-x-12"></div>

                                <div className="relative z-10">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                            {/* Total Hafalan Input */}
                                            <FormField
                                                control={form.control}
                                                name="jumlah_hafalan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <FormLabel className="text-lg font-semibold text-slate-700">Total Hafalan</FormLabel>
                                                                <FormDescription className="text-slate-500">Berapa juz yang sudah Anda hafal?</FormDescription>
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Contoh: 10"
                                                                    min={1}
                                                                    {...field}
                                                                    className="no-spinner h-14 pl-12 pr-4 text-lg bg-white/60 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm"
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        field.onChange(value ? Number(value) : 0);
                                                                    }}
                                                                />
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Kesibukan Select */}
                                            <FormField
                                                control={form.control}
                                                name="kesibukan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-[#2E649C] to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <FormLabel className="text-lg font-semibold text-slate-700">Kesibukan Saat Ini</FormLabel>
                                                                <FormDescription className="text-slate-500">Pilih aktivitas utama Anda sehari-hari</FormDescription>
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={(value) => field.onChange(value)}
                                                            >
                                                                <SelectTrigger className="w-full px-4 py-6 text-lg bg-white/60 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm">
                                                                    <SelectValue placeholder="Pilih kesibukan Anda..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-2 bg-white/95 backdrop-blur-sm">
                                                                    {kesibukanList.map((kesibukan, id) => (
                                                                        <SelectItem
                                                                            value={kesibukan}
                                                                            key={id}
                                                                            className="py-3 px-4 text-base rounded-lg hover:bg-blue-50 focus:bg-blue-50"
                                                                        >
                                                                            {kesibukan}
                                                                        </SelectItem>
                                                                    ))}
                                                                    <SelectItem
                                                                        value="lainnya"
                                                                        className="py-3 px-4 text-base rounded-lg hover:bg-blue-50 focus:bg-blue-50 font-medium text-[#2E649C]"
                                                                    >
                                                                        ✨ Lainnya (Custom)
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Custom Kesibukan Input with Animation */}
                                            <div className={`transition-all duration-500 ease-out overflow-hidden ${showCustomInput
                                                ? 'max-h-40 opacity-100 transform translate-y-0'
                                                : 'max-h-0 opacity-0 transform -translate-y-4'
                                                }`}>
                                                {showCustomInput && (
                                                    <FormField
                                                        control={form.control}
                                                        name="kesibukan_lainnya"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <FormLabel className="text-lg font-semibold text-slate-700">Kesibukan Kustom</FormLabel>
                                                                        <FormDescription className="text-slate-500">Deskripsikan aktivitas utama Anda</FormDescription>
                                                                    </div>
                                                                </div>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder="Contoh: Freelancer desain grafis"
                                                                            {...field}
                                                                            className="h-14 pl-12 pr-4 text-lg bg-white/60 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 backdrop-blur-sm"
                                                                        />
                                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="pt-4">
                                                <Button
                                                    className={`w-full h-16 text-lg font-semibold bg-gradient-to-r from-[#2E649C] to-indigo-600 hover:from-[#3674B5] hover:to-indigo-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${isLoading ? "opacity-75 cursor-not-allowed animate-pulse" : ""
                                                        }`}
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isLoading ? (
                                                            <>
                                                                <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                <span>Menganalisis...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                </svg>
                                                                <span>Dapatkan Rekomendasi</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>

                                    {/* Info Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">
                                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                            <div className="w-8 h-8 bg-[#2E649C] rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-[#2E649C]">Akurat</p>
                                            <p className="text-xs text-[#3674B5]">AI terpercaya</p>
                                        </div>
                                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-green-700">Cepat</p>
                                            <p className="text-xs text-green-600">Hasil instan</p>
                                        </div>
                                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                                            <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-purple-700">Personal</p>
                                            <p className="text-xs text-purple-600">Sesuai kebutuhan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Recommendation Result Modal */}
                    {showResultModal && recommendationResult && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl text-white">
                                    <button
                                        onClick={() => setShowResultModal(false)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">🎉 Rekomendasi AI Siap!</h2>
                                        <p className="text-blue-100">Jadwal muroja'ah yang dipersonalisasi untuk Anda</p>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-8 space-y-6">
                                    {/* Jadwal Rekomendasi */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-green-800">Jadwal Muroja'ah</h3>
                                        </div>
                                        <div className="bg-white/60 rounded-xl p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {recommendationResult.rekomendasi_jadwal.split(', ').map((jadwal: string, index: Key | null | undefined) => (
                                                    <span
                                                        key={index}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium shadow-lg"
                                                    >
                                                        {jadwal.charAt(0).toUpperCase() + jadwal.slice(1)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Tipe Rekomendasi */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-blue-800">Tipe</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">{recommendationResult.tipe_rekomendasi}</p>
                                        </div>

                                        {/* Persentase Efektif */}
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-purple-800">Efektivitas</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {Math.round(recommendationResult.persentase_efektif_historis)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Confidence */}
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-orange-800">AI Confidence Score</h3>
                                                <p className="text-sm text-orange-600">Tingkat kepercayaan AI terhadap rekomendasi</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/60 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-orange-700">Q-Value</span>
                                                <span className="text-lg font-bold text-orange-600">
                                                    {recommendationResult.estimasi_q_value.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-orange-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min((recommendationResult.estimasi_q_value / 2) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            onClick={() => {
                                                setShowResultModal(false);
                                                navigate("/dashboard/mahasantri");
                                            }}
                                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            Kembali ke Dashboard
                                        </Button>
                                        <Button
                                            onClick={() => setShowResultModal(false)}
                                            variant="outline"
                                            className="h-12 px-6 border-2 border-slate-200 hover:border-slate-300 rounded-xl font-semibold"
                                        >
                                            Tutup
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SidebarInset>
            </SidebarProvider>
            <Footer />
        </>
    )
}
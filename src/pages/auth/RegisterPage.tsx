import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Mentor } from "@/types";

const mahasantriSchema = z.object({
    nama: z.string(),
    nim: z.string().min(10, "NIM minimal 10 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    jurusan: z.string(),
    mentor_id: z.number(),
});

const mentorSchema = z.object({
    nama: z.string(),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    gender: z.string(),
});

type MahasantriFormValues = z.infer<typeof mahasantriSchema>;
type MentorFormValues = z.infer<typeof mentorSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [tabValue, setTabValue] = useState("mahasantri");
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGender, setSelectedGender] = useState("");

    const mahasantriForm = useForm<MahasantriFormValues>({
        resolver: zodResolver(mahasantriSchema),
        defaultValues: {
            nama: "",
            nim: "",
            password: "",
            jurusan: "",
            mentor_id: 0,
        },
    });

    const mentorForm = useForm<MentorFormValues>({
        resolver: zodResolver(mentorSchema),
        defaultValues: {
            nama: "",
            email: "",
            password: "",
            gender: "",
        },
    });

    useEffect(() => {
        const fetchMentors = async () => {
            setIsLoading(true);
            toast.loading("Mengambil data mentor...");
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/mentors`);
                setMentors(res.data.data.mentors);
                toast.dismiss();
            } catch (err) {
                console.error("Gagal mengambil data mentor:", err);
                toast.error("Gagal mengambil data mentor");
                toast.dismiss();
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const onSubmitMahasantri = async (values: MahasantriFormValues) => {
        const requestBody = {
            nama: values.nama,
            nim: String(values.nim),
            jurusan: values.jurusan,
            password: values.password,
            mentor_id: values.mentor_id,
            gender: selectedGender,
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register/mahasantri`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Register gagal");
            }

            toast.success("Register berhasil! 🎉");
            navigate("/auth/login");
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
                console.error("Register error:", error.message);
            } else {
                toast.error("Terjadi kesalahan yang tidak diketahui.");
                console.error("Unknown error:", error);
            }
        }
    };

    const onSubmitMentor = async (values: MentorFormValues) => {
        const requestBody = {
            nama: values.nama,
            email: values.email,
            password: values.password,
            gender: values.gender,
        };

        const loadingToast = toast.loading("Sedang memproses...");
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register/mentor`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Register gagal");
            }

            toast.dismiss(loadingToast);
            toast.success("Register berhasil! 🎉");
            setTimeout(() => {
                navigate("/auth/login");
            }, 400);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
                console.error("Register error:", error.message);
            } else {
                toast.error("Terjadi kesalahan yang tidak diketahui.");
                console.error("Unknown error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-5">
            <Toaster position="top-right" />
            {/* Left side with illustration */}
            <div className="relative hidden lg:flex lg:col-span-3 flex-col items-center justify-center p-8 bg-[var(--primary-1)] text-white">
                <div className="max-w-lg mx-auto text-center space-y-5">
                    <img
                        src="/MTADigitalLogo.svg"
                        alt="MTA Learning Management System"
                        width={300}
                        height={300}
                        className="mx-auto"
                    />
                    <h2 className="text-3xl font-medium font-jakarta">MTA Learning Management System</h2>
                    <p className="text-white/80 font-poppins">
                        Website Manajemen Absensi dan Hafalan Mahasantri Mahad Tahfidz Al-Qur'an UIN Bandung
                    </p>
                </div>
            </div>

            {/* Right side with registration form */}
            <div className="flex flex-col lg:col-span-2 items-center justify-center p-8">
                <div className="w-full max-w-lg space-y-6">
                    <img
                        src="/MTADigitalLogoBluWhite.svg"
                        alt="MTA Learning Management System"
                        width={240}
                        height={240}
                        className="mx-auto"
                    />
                    <div className="text-center">
                        <h1 className="text-2xl font-script mb-5 font-jakarta font-bold">Selamat Datang di MTALearn.</h1>
                        <h2 className="text-lg text-gray-600 font-poppins">Silahkan Buat Akun menggunakan Data Diri Anda</h2>
                    </div>

                    <Tabs defaultValue="mahasantri" value={tabValue} onValueChange={setTabValue} className="mx-auto w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mahasantri">Mahasantri</TabsTrigger>
                            <TabsTrigger value="mentor">Mentor</TabsTrigger>
                        </TabsList>

                        {/* Mahasantri Registration Form */}
                        <TabsContent value="mahasantri">
                            <Form {...mahasantriForm}>
                                <form onSubmit={mahasantriForm.handleSubmit(onSubmitMahasantri)} className="space-y-6">
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="nama"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Nama Lengkap</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Masukkan Nama Lengkap Anda" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="nim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Nomor Induk Mahasiswa (NIM)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Masukkan NIM Anda" {...field} className="no-spinner" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Kata Sandi</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi" {...field} />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                            onClick={togglePasswordVisibility}
                                                            tabIndex={-1}
                                                        >
                                                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="jurusan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Jurusan Mahasiswa</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Masukkan Jurusan Anda" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="mentor_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Pilih Mentor</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value ? String(field.value) : ""}
                                                        onValueChange={(value) => {
                                                            const selectedMentor = mentors.find(mentor => mentor.id === Number(value));
                                                            field.onChange(Number(value));
                                                            setSelectedGender(selectedMentor ? selectedMentor.gender : "");
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Mentor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
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
                                    <Button
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Loading..." : "Buat Akun"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* Mentor Registration Form */}
                        <TabsContent value="mentor">
                            <Form {...mentorForm}>
                                <form onSubmit={mentorForm.handleSubmit(onSubmitMentor)} className="space-y-6">
                                    <FormField
                                        control={mentorForm.control}
                                        name="nama"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Nama Lengkap</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Masukkan Nama Lengkap Anda" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mentorForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Masukkan Email Anda" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mentorForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Kata Sandi</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi Anda" {...field} />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                            onClick={togglePasswordVisibility}
                                                            tabIndex={-1}
                                                        >
                                                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={mentorForm.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">Pilih Gender</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => field.onChange(value)}
                                                    >
                                                        <SelectTrigger>
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
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Loading..." : "Buat Akun"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-400"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">atau</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        Sudah Punya Akun?{" "}
                        <Link
                            to="/auth/login"
                            className="text-md font-semibold text-[var(--primary-2)] hover:text-[var(--primary-1)]"
                        >
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
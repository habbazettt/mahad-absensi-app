import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import ToasterLayout from "@/components/ToasterLayout";

// Schema untuk Mentor
const mentorSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

// Schema untuk Mahasantri
const mahasantriSchema = z.object({
    nim: z.string().min(10, "NIM harus terdiri dari 10 digit"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

type MentorFormValues = z.infer<typeof mentorSchema>;
type MahasantriFormValues = z.infer<typeof mahasantriSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [tabValue, setTabValue] = useState("mahasantri");
    const [isLoading, setIsLoading] = useState(false);

    // Form untuk Mentor
    const mentorForm = useForm<MentorFormValues>({
        resolver: zodResolver(mentorSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Form untuk Mahasantri
    const mahasantriForm = useForm<MahasantriFormValues>({
        resolver: zodResolver(mahasantriSchema),
        defaultValues: {
            nim: "",
            password: "",
        },
    });

    const handleLogin = async (values: MentorFormValues | MahasantriFormValues, role: string) => {
        setIsLoading(true);
        const toastId = toast.loading("Memproses login...");

        try {
            const url = `${import.meta.env.VITE_API_URL}/auth/login/${role}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login gagal");
            }

            const data = await response.json();
            localStorage.setItem("auth_token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            toast.success("Login berhasil! 🎉", { id: toastId });
            if (values.password === "newuser2025") {
                navigate("/auth/reset-password/newuser");
            } else {
                navigate(role === "mentor" ? "/dashboard" : "/dashboard/mahasantri");
            }

            if (data.data.user.mentor_id == 19) {
                navigate(`/dashboard/mahasantri/raport-kelulusan-maba`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-5">
            <ToasterLayout />
            {/* Left Section */}
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

            {/* Right Section */}
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
                        <h1 className="text-2xl font-script mb-5 font-jakarta font-bold">
                            Selamat Datang di MTALearn.
                        </h1>
                        <h2 className="text-lg text-gray-600 font-poppins">
                            Login untuk Melanjutkan
                        </h2>
                    </div>

                    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mahasantri">Mahasantri</TabsTrigger>
                            <TabsTrigger value="mentor">Mentor</TabsTrigger>
                        </TabsList>

                        {/* Mahasantri Login Form */}
                        <TabsContent value="mahasantri">
                            <Form {...mahasantriForm}>
                                <form
                                    onSubmit={mahasantriForm.handleSubmit((values) =>
                                        handleLogin(values, "mahasantri")
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="nim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">
                                                    NIM
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Masukkan NIM Anda"
                                                        {...field}
                                                    />
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
                                                <FormLabel>Kata Sandi</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Masukkan kata sandi"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                            onClick={() => setShowPassword(!showPassword)}
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

                                    <div className="text-right">
                                        <Link
                                            to="/auth/forgot-password"
                                            className="text-sm font-semibold text-[var(--primary-1)] hover:text-gray-700"
                                        >
                                            Lupa password?
                                        </Link>
                                    </div>

                                    <Button
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Memproses..." : "Login"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* Mentor Login Form */}
                        <TabsContent value="mentor">
                            <Form {...mentorForm}>
                                <form
                                    onSubmit={mentorForm.handleSubmit((values) =>
                                        handleLogin(values, "mentor")
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={mentorForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Masukkan email Anda"
                                                        {...field}
                                                    />
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
                                                <FormLabel>Kata Sandi</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Masukkan kata sandi"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                            onClick={() => setShowPassword(!showPassword)}
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

                                    <div className="text-right">
                                        <Link
                                            to="/auth/forgot-password"
                                            className="text-sm font-semibold text-[var(--primary-1)] hover:text-gray-700"
                                        >
                                            Lupa password?
                                        </Link>
                                    </div>

                                    <Button
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Memproses..." : "Login"}
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
                        Belum Punya Akun?{" "}
                        <Link
                            to={"/auth/register"}
                            className="text-md font-semibold text-[var(--primary-2)] hover:text-[var(--primary-1)]"
                        >
                            Daftar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
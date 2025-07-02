import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import ToasterLayout from "@/components/ToasterLayout";

const passwordSchema = z.object({
    password: z.string().min(6, "Password minimal 6 karakter"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function NewUserResetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const navigate = useNavigate();

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
        },
    });

    const handleSubmit = async (values: PasswordFormValues) => {
        const userRaw = localStorage.getItem("user");
        if (!userRaw) {
            toast.error("Data pengguna tidak ditemukan. Silakan login kembali.");
            navigate("/auth/login");
            return;
        }

        const user = JSON.parse(userRaw);

        const requestBody: { nim?: string; email?: string; new_password: string } = {
            new_password: values.password,
        };

        if (user.user_type === "mahasantri" && user.nim) {
            requestBody.nim = user.nim;
        } else if (user.user_type === "mentor" && user.email) {
            requestBody.email = user.email;
        } else {
            toast.error("Data pengguna tidak lengkap.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Sedang memproses reset password...");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/forget-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Reset Password gagal");
            }

            toast.success("Reset Password Berhasil! 🎉", { id: toastId });
            navigate("/auth/login");
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan yang tidak diketahui.";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen grid lg:grid-cols-5">
            <ToasterLayout />

            {/* Left section */}
            <div className="relative hidden lg:flex lg:col-span-3 flex-col items-center justify-center p-8 bg-[var(--primary-1)] text-white">
                <div className="max-w-lg mx-auto text-center space-y-5">
                    <img
                        src="/MTADigitalLogo.svg"
                        alt="MTA Learning Management System"
                        width={300}
                        height={300}
                        className="mx-auto"
                    />
                    <h2 className="text-3xl font-medium font-jakarta">
                        MTA Learning Management System
                    </h2>
                    <p className="text-white/80 font-poppins">
                        Website Manajemen Absensi dan Hafalan Mahasantri Mahad Tahfidz
                        Al-Qur'an UIN Bandung
                    </p>
                </div>
            </div>

            {/* Right section */}
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
                            Buat Password Password Baru Anda di sini
                        </h2>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-6 mt-4"
                        >
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">
                                            Kata Sandi Baru
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Masukkan kata sandi baru"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={togglePasswordVisibility}
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? (
                                                        <Eye size={20} />
                                                    ) : (
                                                        <EyeOff size={20} />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Memproses..." : "Reset Password"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}

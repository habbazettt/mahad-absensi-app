import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form"

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"

const registerSchema = z.object({
    nama: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    gender: z.string(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterMentor() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const togglePasswordVisibility = () => { setShowPassword(!showPassword) }

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nama: "",
            email: "",
            password: "",
            gender: "",
        },
    })

    const onSubmit = async (values: RegisterFormValues) => {
        const requestBody = {
            nama: values.nama,
            email: values.email,
            password: values.password,
            gender: values.gender,
        }

        // Show loading toast
        const loadingToast = toast.loading("Sedang memproses...")

        setLoading(true)

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register/mentor`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Register gagal")
            }

            toast.dismiss(loadingToast)

            toast.success("Register berhasil! 🎉")

            setTimeout(() => {
                navigate("/auth/mentor/login")
            }, 400)
            setLoading(false)
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message)
                console.error("Register error:", error.message)
            } else {
                toast.error("Terjadi kesalahan yang tidak diketahui.")
                console.error("Unknown error:", error)
            }
        } finally {
            setLoading(false)
        }
    }

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
                    <p className=" text-white/80 font-poppins">
                        Website Manajemen Absensi dan Hafalan Mahasantri Mahad Tahfidz Al-Qur'an UIN Bandung
                    </p>
                </div>
            </div>

            {/* Right side with login form */}
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

                    {/* Input Form */}
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
                                            <Input type="text" className="w-full border rounded" placeholder="Masukkan Nama Lengkap Anda" {...field} />
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
                                            <Input type="email" className="w-full border rounded" placeholder="Masukkan Email Anda" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kata Sandi</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Masukkan kata sandi Anda"
                                                    {...field}
                                                />
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

                            {/* Dropdown Gender */}
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilih Gender</FormLabel>
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
                                type="submit"
                                className="w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white"
                                disabled={loading}
                            >
                                {loading ? "Sedang Memproses..." : "Buat Akun"}
                            </Button>

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
                                    to="/auth/mentor/login"
                                    className="text-md font-semibold text-[var(--primary-2)] hover:text-[var(--primary-1)]"
                                >
                                    Masuk
                                </Link>
                            </p>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}


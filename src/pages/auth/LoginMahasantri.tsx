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
import { useNavigate } from "react-router-dom"

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form"

const loginSchema = z.object({
    nim: z.string().min(10, "NIM harus terdiri dari 10 digit"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginMahasantri() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false) // Menambahkan state loading
    const togglePasswordVisibility = () => { setShowPassword(!showPassword) }

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            nim: "",
            password: "",
        },
    })

    const onSubmit = async (values: LoginFormValues) => {
        const requestBody = {
            nim: values.nim,
            password: values.password,
        }

        try {
            setIsLoading(true) // Mulai loading
            toast.loading("Memproses login...", { id: "login" }) // Menampilkan toast loading

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login/mahasantri`,
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
                throw new Error(errorData.message || "Login gagal")
            }

            const data = await response.json()

            localStorage.setItem("auth_token", data.data.token)
            localStorage.setItem("user", JSON.stringify(data.data.user))

            toast.success("Login berhasil! 🎉", { id: "login" })
            navigate("/")
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message, { id: "login" })
                console.error("Login error:", error.message)
            } else {
                toast.error("Terjadi kesalahan yang tidak diketahui.", { id: "login" })
                console.error("Unknown error:", error)
            }
        } finally {
            setIsLoading(false) // Selesai loading
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
                        <h2 className="text-lg text-gray-600 font-poppins">Login Sebagai Mahasantri untuk Melanjutkan</h2>
                    </div>

                    {/* Input Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* NIM */}
                            <FormField
                                control={form.control}
                                name="nim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold text-gray-700">Nomor Induk Mahasiswa (NIM)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="w-full border rounded no-spinner"
                                                placeholder="Masukkan NIM Anda"
                                                {...field}
                                            />
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

                            <div className="text-right">
                                <Link to="/auth/forgot-password" className="text-sm font-semibold font-poppins text-[var(--primary-1)] hover:text-gray-700">
                                    Lupa password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white"
                                disabled={isLoading} // Menonaktifkan tombol saat loading
                            >
                                {isLoading ? "Memproses..." : "Login"} {/* Menampilkan teks loading */}
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
                                Belum Punya Akun?{" "}
                                <Link
                                    to="/auth/mahasantri/register"
                                    className="text-md font-semibold text-[var(--primary-2)] hover:text-[var(--primary-1)]"
                                >
                                    Daftar
                                </Link>
                            </p>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

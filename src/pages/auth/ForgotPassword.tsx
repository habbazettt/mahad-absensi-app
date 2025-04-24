import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form"

const mahasantriSchema = z.object({
    nim: z.string().min(8, "NIM minimal 8 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
})

const mentorSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
})

type MahasantriFormValues = z.infer<typeof mahasantriSchema>
type MentorFormValues = z.infer<typeof mentorSchema>

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const [tabValue, setTabValue] = useState("mahasantri")
    const [showPassword, setShowPassword] = useState(false)
    const togglePasswordVisibility = () => setShowPassword(!showPassword)
    const navigate = useNavigate()

    const mahasantriForm = useForm<MahasantriFormValues>({
        resolver: zodResolver(mahasantriSchema),
        defaultValues: {
            nim: "",
            password: "",
        },
    })

    const mentorForm = useForm<MentorFormValues>({
        resolver: zodResolver(mentorSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const handleSubmit = async (
        values: MahasantriFormValues | MentorFormValues,
        role: "mahasantri" | "mentor"
    ) => {
        let requestBody: { nim?: string; email?: string; new_password: string }

        if (role === "mahasantri" && "nim" in values) {
            requestBody = {
                nim: values.nim,
                new_password: values.password,
            }
        } else if (role === "mentor" && "email" in values) {
            requestBody = {
                email: values.email,
                new_password: values.password,
            }
        } else {
            toast.error("Tipe data tidak valid untuk role: " + role)
            return
        }

        setIsLoading(true)
        const toastId = toast.loading("Sedang memproses reset password...")

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forget-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Reset Password gagal")
            }

            toast.success("Reset Password Berhasil! 🎉", { id: toastId })
            navigate(role === "mahasantri" ? "/auth/mahasantri/login" : "/auth/mentor/login")
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message, { id: toastId })
                console.error("Reset Password error:", error.message)
            } else {
                toast.error("Terjadi kesalahan yang tidak diketahui.", { id: toastId })
                console.error("Unknown error:", error)
            }
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="min-h-screen grid lg:grid-cols-5">
            <Toaster position="top-right" />
            {/* Left section */}
            <div className="relative hidden lg:flex lg:col-span-3 flex-col items-center justify-center p-8 bg-[var(--primary-1)] text-white">
                <div className="max-w-lg mx-auto text-center space-y-5">
                    <img src="/MTADigitalLogo.svg" alt="MTA Learning Management System" width={300} height={300} className="mx-auto" />
                    <h2 className="text-3xl font-medium font-jakarta">MTA Learning Management System</h2>
                    <p className="text-white/80 font-poppins">
                        Website Manajemen Absensi dan Hafalan Mahasantri Mahad Tahfidz Al-Qur'an UIN Bandung
                    </p>
                </div>
            </div>

            {/* Right section */}
            <div className="flex flex-col lg:col-span-2 items-center justify-center p-8">
                <div className="w-full max-w-lg space-y-6">
                    <img src="/MTADigitalLogoBluWhite.svg" alt="MTA Learning Management System" width={240} height={240} className="mx-auto" />
                    <div className="text-center">
                        <h1 className="text-2xl font-script mb-5 font-jakarta font-bold">Selamat Datang di MTALearn.</h1>
                        <h2 className="text-lg text-gray-600 font-poppins">Perbarui Password Anda di sini</h2>
                    </div>

                    <Tabs defaultValue="mahasantri" value={tabValue} onValueChange={setTabValue} className="mx-auto w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mahasantri">Mahasantri</TabsTrigger>
                            <TabsTrigger value="mentor">Mentor</TabsTrigger>
                        </TabsList>

                        {/* Mahasantri Form */}
                        <TabsContent value="mahasantri">
                            <Form {...mahasantriForm}>
                                <form onSubmit={mahasantriForm.handleSubmit((v) => handleSubmit(v, "mahasantri"))} className="space-y-6 mt-4">
                                    <FormField
                                        control={mahasantriForm.control}
                                        name="nim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-700">NIM</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan NIM Anda" {...field} />
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
                                                <FormLabel className="text-sm font-bold text-gray-700">Kata Sandi Baru</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi baru" {...field} />
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
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                    >
                                        {isLoading ? "Memproses..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* Mentor Form */}
                        <TabsContent value="mentor">
                            <Form {...mentorForm}>
                                <form onSubmit={mentorForm.handleSubmit((v) => handleSubmit(v, "mentor"))} className="space-y-6 mt-4">
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
                                                <FormLabel className="text-sm font-bold text-gray-700">Kata Sandi Baru</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi baru" {...field} />
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
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full bg-[var(--primary-1)] hover:bg-[#275586] text-white py-2 px-4 rounded transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                    >
                                        {isLoading ? "Memproses..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

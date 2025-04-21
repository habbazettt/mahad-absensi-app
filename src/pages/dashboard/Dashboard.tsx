import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import StatCard from "@/components/StatCard"
import { BookOpen, CalendarCheck, Users } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MahasantriWithHafalan } from "@/types/types"

export default function DashboardPage() {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [totalMahasantri, setTotalMahasantri] = useState(0)
    const [totalHafalan, setTotalHafalan] = useState(0)
    const [mahasantriList, setMahasantriList] = useState<MahasantriWithHafalan[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isHafalanDialogOpen, setIsHafalanDialogOpen] = useState(false)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const totalPages = Math.ceil(mahasantriList.length / itemsPerPage)

    const paginatedMahasantri = mahasantriList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    useEffect(() => {
        const user = localStorage.getItem("user")
        const token = localStorage.getItem("auth_token")

        if (!user || !token) {
            navigate("/")
            return
        }

        try {
            const userData = JSON.parse(user)

            if (userData.user_type !== "mentor") {
                navigate("/")
                return
            }

            setUserName(userData.nama)
            setTotalMahasantri(userData.mahasantri_count)

            const fetchHafalan = async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/hafalan/mentor/${userData.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    const result = await response.json()

                    if (result.status) {
                        const mahasantriList: MahasantriWithHafalan[] = result.data.mahasantriList
                        setMahasantriList(mahasantriList)

                        const total = mahasantriList.reduce((acc: number, item: MahasantriWithHafalan) => {
                            return acc + item.list_hafalan.length
                        }, 0)

                        setTotalHafalan(total)
                    }
                } catch (error) {
                    console.error("Gagal fetch total hafalan:", error)
                }
            }

            fetchHafalan()
        } catch (error) {
            console.error("Failed to parse user data:", error)
            navigate("/")
        }
    }, [navigate])

    const handleOpenHafalanDialog = () => {
        setIsHafalanDialogOpen(true)
    }

    useEffect(() => {
        if (isDialogOpen) {
            setCurrentPage(1)
        }
    }, [isDialogOpen])

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-primary">Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-100">
                    <div className="text-lg lg:text-2xl font-bold mt-3">
                        Welcome, Ust. {userName}
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div onClick={() => setIsDialogOpen(true)}>
                            <StatCard
                                title="Total Mahasantri"
                                value={totalMahasantri}
                                icon={<Users />}
                            />
                        </div>
                        <div onClick={handleOpenHafalanDialog}>
                            <StatCard
                                title="Total Setoran"
                                value={`${totalHafalan} Setoran`}
                                icon={<BookOpen />}
                            />
                        </div>
                        <StatCard
                            title="Total Absensi"
                            value="28 Kehadiran"
                            icon={<CalendarCheck />}
                        />
                    </div>

                    {/* Mahasantri Alert Dialog */}
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Mahasantri List</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Below is the list of Mahasantri assigned to you.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="overflow-x-auto max-h-[50vh]">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border">Nama</th>
                                            <th className="px-4 py-2 border">NIM</th>
                                            <th className="px-4 py-2 border">Jurusan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedMahasantri.map((mahasantriWithHafalan) => (
                                            <tr key={mahasantriWithHafalan.mahasantri.id}>
                                                <td className="px-4 py-2 border">
                                                    {mahasantriWithHafalan.mahasantri.nama}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {mahasantriWithHafalan.mahasantri.nim}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    {mahasantriWithHafalan.mahasantri.jurusan}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Pagination Controls */}
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                                    Close
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Hafalan Alert Dialog */}
                    <AlertDialog open={isHafalanDialogOpen} onOpenChange={setIsHafalanDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Daftar Hafalan</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Berikut adalah daftar hafalan yang telah disetorkan oleh mahasantri.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="overflow-x-auto max-h-[50vh]">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border">Nama</th>
                                            <th className="px-4 py-2 border">Juz</th>
                                            <th className="px-4 py-2 border">Halaman</th>
                                            <th className="px-4 py-2 border">Total Setoran</th>
                                            <th className="px-4 py-2 border">Kategori</th>
                                            <th className="px-4 py-2 border">Waktu</th>
                                            <th className="px-4 py-2 border">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedMahasantri.map((mahasantriWithHafalan) =>
                                            mahasantriWithHafalan.list_hafalan.map((hafalan) => (
                                                <tr key={hafalan.id}>
                                                    <td className="px-4 py-2 border">
                                                        {mahasantriWithHafalan.mahasantri.nama}
                                                    </td>
                                                    <td className="px-4 py-2 border">{hafalan.juz}</td>
                                                    <td className="px-4 py-2 border">{hafalan.halaman}</td>
                                                    <td className="px-4 py-2 border">{hafalan.total_setoran}</td>
                                                    <td className="px-4 py-2 border">{hafalan.kategori}</td>
                                                    <td className="px-4 py-2 border">{hafalan.waktu}</td>
                                                    <td className="px-4 py-2 border">{hafalan.catatan}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                {/* Pagination Controls */}
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setIsHafalanDialogOpen(false)}>
                                    Close
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
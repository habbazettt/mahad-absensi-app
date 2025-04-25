import {
  BadgeCheck,
  ChevronsUpDown,
  Edit,
  LogOut,
  User,
  VenusAndMars,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react"
import { getInitials } from "@/utils/userUtils"
import { motion, AnimatePresence } from "framer-motion"
import { cn, handleLogout } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface User {
  id: number
  nama: string
  email: string
  gender: string
  mahasantri_count: number
  user_type: "mentor" | "mahasantri"
}

export function NavUser() {
  const [user, setUser] = useState<User | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData: User = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error("Gagal parse data user:", error)
      }
    }
  }, [])

  if (!user) return null

  const handleLogoutSidebar = () => {
    handleLogout(navigate);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground font-poppins"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.nama)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.nama}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user.nama)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.nama}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Role: {user.user_type}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User />
                  Mahasantri Dibimbing: {user.mahasantri_count}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <VenusAndMars />
                  Gender: {user.gender === "L" ? "Laki-laki" : "Perempuan"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/dashboard/mentor/edit/${user.id}`)}>
                <Edit className="text-blue-400" />
                Edit Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog(true)}>
                <LogOut className="text-red-500" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Alert Dialog with Framer Motion */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogPortal>
          <AnimatePresence>
            {openDialog && (
              <motion.div
                key="alert-dialog"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <AlertDialogContent className={cn("transition-none")}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yakin ingin keluar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus sesi dan Anda harus login ulang.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpenDialog(false)}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogoutSidebar} className="hover:cursor-pointer">Logout</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </motion.div>
            )}
          </AnimatePresence>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}

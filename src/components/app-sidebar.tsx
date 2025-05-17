import * as React from "react"
import {
  BookOpenCheck,
  BrainCircuit,
  CalendarRange,
  Info,
  UserLock,
  Users,
} from "lucide-react"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  projects: [
    {
      name: "Informasi",
      url: "/dashboard",
      icon: Info,
    },
    {
      name: "Data Mentor",
      url: "/dashboard/info-mentor",
      icon: UserLock,
    },
    {
      name: "Data Mahasantri",
      url: "/dashboard/info-mahasantri",
      icon: Users,
    },
    {
      name: "Absensi",
      url: "/dashboard/absensi",
      icon: CalendarRange,
    },
    {
      name: "Setoran",
      url: "/dashboard/setoran",
      icon: BookOpenCheck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { user_type } = user

  let filteredProjects = data.projects

  if (user_type === 'mahasantri') {
    filteredProjects = [
      {
        name: "Informasi",
        url: "/dashboard/mahasantri",
        icon: Info,
      },
      {
        name: "Raport Kelulusan",
        url: "/dashboard/mahasantri/raport-kelulusan",
        icon: BookOpenCheck,
      },
      {
        name: "AI Rekomendasi",
        url: "/dashboard/mahasantri/ai-rekomendasi",
        icon: BrainCircuit,
      }
    ]
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <img
                src="/MTADigitalLogoBluWhite.svg"
                alt="MTA Learning Management System"
                className="lg:h-20 h-16 rounded-lg"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={filteredProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

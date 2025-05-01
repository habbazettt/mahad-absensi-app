import * as React from "react"
import {
  BookOpenCheck,
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
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

import {
  ArrowLeftRight,
  BarChart2,
  LayoutDashboard,
  Menu,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link className="flex items-center" href="/dashboard">
            <BarChart2 className="h-6 w-6 text-orange-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">
              UP Tracker
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="fixed bottom-4 left-4 z-10">
        <SidebarTrigger>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
      </div>
    </>
  );
}

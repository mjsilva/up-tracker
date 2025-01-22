import {
  ArrowBigUpDashIcon,
  ArrowLeftRight,
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
    url: "/",
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
          <Link href={"/"} className="group/logo">
            <h2 className="flex items-center text-2xl font-bold tracking-tight">
              <ArrowBigUpDashIcon
                size={60}
                className="fill-orange-400 stroke-1 transition-transform duration-500 ease-in-out motion-safe:group-hover/logo:-translate-y-1"
              />
              <span className="-ml-1">tracker</span>
            </h2>
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

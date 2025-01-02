import { SidebarProvider } from "@/components/ui/sidebar";
import React, { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className={"w-full"}>
          <header className="flex items-center justify-between px-6 py-4 border-b">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </SidebarProvider>
    </>
  );
}

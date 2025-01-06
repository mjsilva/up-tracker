import { SidebarProvider } from "@/components/ui/sidebar";
import React, { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className={"w-full"}>
          <header className="flex items-center justify-end border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <UserButton />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </SidebarProvider>
    </>
  );
}

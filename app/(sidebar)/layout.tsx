import { SidebarProvider } from "@/components/ui/sidebar";
import React, { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { currentUserServer } from "@/lib/services/user-service";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { SettingKey } from "@prisma/client";
import { Title } from "@/app/(sidebar)/_components/title";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await currentUserServer();

  if (!user) {
    redirect("/sign-in");
  }

  const apiKey = await prisma.setting.findUnique({
    select: { value: true },
    where: { userId_key: { userId: user.id, key: SettingKey.UP_BANK_API_KEY } },
  });

  if (!apiKey?.value) {
    redirect("/onboarding");
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className={"w-full"}>
          <header className="flex items-center justify-between border-b px-6 py-4">
            <Title />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <UserButton />
            </div>
          </header>
          {children}
        </div>
      </SidebarProvider>
    </>
  );
}

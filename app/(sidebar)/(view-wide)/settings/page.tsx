import React from "react";
import { SettingsForm } from "@/app/(sidebar)/(view-wide)/settings/_components/settings-form";
import { currentUserServer } from "@/lib/services/user-service";
import prisma from "@/lib/db";

async function Page() {
  const user = await currentUserServer();

  const settings = await prisma.setting.findMany({
    where: { userId: user.id },
  });

  return <SettingsForm currentSettings={settings} />;
}

export default Page;

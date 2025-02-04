"use client";

import { Setting } from "@prisma/client";
import { ApiKey } from "@/app/(sidebar)/(view-wide)/settings/_components/api-key";
import { Webhook } from "@/app/(sidebar)/(view-wide)/settings/_components/webhook";

export function SettingsForm({
  currentSettings,
}: {
  currentSettings: Setting[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <div className={"flex flex-wrap gap-6"}>
        <ApiKey />
        <Webhook currentSettings={currentSettings} />
      </div>
    </div>
  );
}

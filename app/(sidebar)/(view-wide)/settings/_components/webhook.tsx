import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Setting, SettingKey } from "@prisma/client";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createWebhook } from "@/app/(sidebar)/(view-wide)/settings/actions";
import { toast } from "sonner";

type WebhookProps = { currentSettings: Setting[] };

export function Webhook({ currentSettings }: WebhookProps) {
  async function handleSetupWebhook() {
    await createWebhook();
    toast.info("webhook created");
  }

  return (
    <Card className={"max-w-screen-sm"}>
      <CardHeader>
        <CardTitle>UP Bank Webhook</CardTitle>
        <CardDescription>
          We use webhooks to maintain a sync with all your transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!currentSettings.some(
          (s) => s.key === SettingKey.UP_BANK_WEBHOOK_SECRET_KEY,
        ) ? (
          <div className={"flex flex-col gap-6"}>
            <div className={"inline-flex items-center gap-2"}>
              <TriangleAlertIcon /> You don&#39;t currently have a webhook setup
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSetupWebhook}>Setup webhook</Button>
            </div>
          </div>
        ) : (
          <p>Webhook has been created</p>
        )}
      </CardContent>
    </Card>
  );
}

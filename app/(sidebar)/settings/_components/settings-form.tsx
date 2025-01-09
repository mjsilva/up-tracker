"use client";

import { useActionState } from "react";
import Form from "next/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveSettingsFormAction } from "@/app/(sidebar)/settings/actions";
import { ApiKeyHelperModal } from "@/components/api-key-helper-modal";
import { Setting, SettingKey } from "@prisma/client";

export function SettingsForm({
  currentSettings,
}: {
  currentSettings: Setting[];
}) {
  const [state, formAction] = useActionState(saveSettingsFormAction, null);

  return (
    <div className="max-w-screen-sm space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <Form action={formAction} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <section>
            <div className="flex items-center space-x-2">
              <Label htmlFor="apiKey">Up Bank API Key</Label>
              <ApiKeyHelperModal />
            </div>
            <Input
              name="apiKey"
              type="password"
              placeholder="Enter your Up Bank API key"
              required
              className="mt-1"
              defaultValue={
                currentSettings?.find(
                  (s) => s.key === SettingKey.UP_BANK_API_KEY,
                )?.value || undefined
              }
            />
            {state?.validationErrors?.apiKey && (
              <p className="mt-2 text-sm text-red-600">
                {state.validationErrors.apiKey[0]}
              </p>
            )}
          </section>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </Form>
    </div>
  );
}

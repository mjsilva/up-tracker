import React, { useActionState, useEffect } from "react";
import { saveApiKeyFormAction } from "@/app/(sidebar)/(view-wide)/settings/actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Form from "next/form";
import { Label } from "@/components/ui/label";
import { ApiKeyHelperModal } from "@/components/api-key-helper-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ApiKey() {
  const [state, formAction] = useActionState(saveApiKeyFormAction, null);

  useEffect(() => {
    if (typeof state?.isSuccess === "undefined") {
      return;
    }

    if (state.isSuccess) {
      toast.success("saved successfully");
    } else {
      toast.error(
        `error saving - ${state.validationErrors} | ${state.backendErrors}`,
      );
    }
  }, [state]);

  return (
    <Card className={"max-w-screen-sm"}>
      <CardHeader>
        <CardTitle>UP Bank API key</CardTitle>
        <CardDescription>
          We use this key to sync your transactions and update webhook. If you
          change the API key please update it here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form action={formAction}>
          <div className="mb-10 grid grid-cols-1 gap-6">
            <section>
              <div className="flex items-center space-x-2">
                <Label htmlFor="apiKey">Up Bank API Key</Label>
                <ApiKeyHelperModal />
              </div>
              <Input
                name="apiKey"
                type="password"
                placeholder="Enter your new Up Bank API key"
                required
                className="mt-1"
              />
              {state?.validationErrors?.apiKey && (
                <p className="mt-2 text-sm text-red-600">
                  {state.validationErrors.apiKey[0]}
                </p>
              )}
            </section>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save api key</Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

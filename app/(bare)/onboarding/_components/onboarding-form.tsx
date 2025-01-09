"use client";

import React, { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { ApiKeyHelperModal } from "@/app/(sidebar)/settings/_components/api-key-helper-modal";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { saveOnboardingFormAction } from "@/app/(bare)/onboarding/actionts";

export function OnboardingForm() {
  const [state, formAction] = useActionState(saveOnboardingFormAction, null);

  return (
    <Form action={formAction} className="space-y-8">
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
        />
        {state?.validationErrors?.apiKey && (
          <p className="mt-2 text-sm text-red-600">
            {state.validationErrors.apiKey[0]}
          </p>
        )}
      </section>
      <Button type="submit" className={"w-full"}>
        Save API Key
      </Button>
    </Form>
  );
}

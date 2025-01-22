"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { currentUserServer } from "@/lib/services/user-service";
import { encrypt } from "@/lib/encryption";
import { SettingKey } from "@prisma/client";
import { FormActionFnReturnType } from "@/lib/types";
import { redirect } from "next/navigation";
import { inngest } from "@/lib/ingest/client";
import {
  createAndSaveWebhook,
  validateUpbankApiKey,
} from "@/lib/services/upbank";

export async function saveOnboardingFormAction(
  prevState: unknown,
  formData: FormData,
): FormActionFnReturnType {
  const validatedFields = z
    .object({
      apiKey: z.string().min(1, "API Key is required"),
    })
    .safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      isSuccess: false,
    };
  }

  const { apiKey } = validatedFields.data;

  const isValidApiKey = await validateUpbankApiKey(apiKey);
  if (!isValidApiKey) {
    return {
      validationErrors: {
        apiKey: ["Invalid API Key. Please check and try again."],
      },
      isSuccess: false,
    };
  }

  const user = await currentUserServer();

  if (!user) {
    throw new Error("user not found");
  }

  await prisma.setting.upsert({
    where: { userId_key: { userId: user.id, key: SettingKey.UP_BANK_API_KEY } },
    create: {
      userId: user.id,
      key: SettingKey.UP_BANK_API_KEY,
      value: encrypt(apiKey),
    },
    update: {
      value: encrypt(apiKey),
    },
  });

  await inngest.send({
    name: "transactions/full-sync",
    data: { userId: user.id },
  });

  await createAndSaveWebhook(user.id);

  redirect("/dashboard");
}

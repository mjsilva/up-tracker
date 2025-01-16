"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { currentUserServerOrThrow } from "@/lib/services/user-service";
import { encrypt } from "@/lib/encryption";
import { SettingKey } from "@prisma/client";
import { FormActionFnReturnType } from "@/lib/types";
import { createAndSaveWebhook } from "@/lib/services/upbank";

export async function saveApiKeyFormAction(
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

  const user = await currentUserServerOrThrow();

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

  revalidatePath("/settings");

  return {
    isSuccess: true,
  };
}

export async function createWebhook() {
  const user = await currentUserServerOrThrow();
  await createAndSaveWebhook(user.id);

  revalidatePath("/settings");
}

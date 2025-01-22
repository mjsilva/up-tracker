import React from "react";
import { OnboardingForm } from "@/app/(bare)/onboarding/_components/onboarding-form";
import { currentUserServer } from "@/lib/services/user-service";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { SettingKey } from "@prisma/client";

async function Page() {
  const user = await currentUserServer();

  if (!user) {
    redirect("/sign-in");
  }

  const apiKey = await prisma.setting.findUnique({
    select: { value: true },
    where: { userId_key: { userId: user.id, key: SettingKey.UP_BANK_API_KEY } },
  });

  if (apiKey?.value) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <h1 className="mb-4 text-left text-2xl font-bold">
          Welcome to Up Tracker
        </h1>
        <p className="mb-4 text-left text-muted-foreground">
          Take control of your spending with <strong>Up Tracker</strong>.
        </p>
        <p className="mb-6 text-left text-muted-foreground">
          Once synced, you’ll be able to track your spending, categorise your
          expenses, and make smarter financial decisions.
        </p>
        <OnboardingForm />
      </div>
    </div>
  );
}

export default Page;

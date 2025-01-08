"use server";

import { inngest } from "@/lib/ingest/client";
import { currentUserServerOrThrow } from "@/lib/services/user-service";

export async function syncTransactions() {
  const user = await currentUserServerOrThrow();

  await inngest.send({
    name: "transactions/partial-sync",
    data: {
      userId: user.id,
    },
  });

  console.log("syncTransactions called");
}

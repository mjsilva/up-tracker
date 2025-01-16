import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import {
  UpBankWebhookEventTypeSchema,
  UpBankWebhookPayloadSchema,
} from "@/lib/schemas/upbank";
import prisma from "@/lib/db";
import { SettingKey } from "@prisma/client";
import { decrypt } from "@/lib/encryption";
import { inngest } from "@/lib/ingest/client";

function verifySignature(
  body: string,
  receivedSignature: string,
  secretKey: string,
): boolean {
  const computedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computedSignature, "utf-8"),
    Buffer.from(receivedSignature, "utf-8"),
  );
}

async function handleEvent({
  eventType,
  payload,
  userId,
}: {
  eventType: z.infer<typeof UpBankWebhookEventTypeSchema>;
  payload: z.infer<typeof UpBankWebhookPayloadSchema>["data"];
  userId: string;
}) {
  switch (eventType) {
    case "PING":
      console.log("Received PING event.");
      break;

    case "TRANSACTION_CREATED":
    case "TRANSACTION_SETTLED":
      console.log("Transaction Created/Settled:", payload);
      if (!payload.relationships.transaction?.data.id) {
        console.error("Transaction ID is missing in the payload.");
        break;
      }
      await inngest.send({
        name: "transactions/single-sync",
        data: {
          userId,
          transactionId: payload.relationships.transaction?.data.id,
        },
      });
      break;

    case "TRANSACTION_DELETED":
      console.log("Transaction Deleted:", payload);
      // todo: handle transaction deletion logic here
      break;

    default:
      console.warn("Unhandled event type:", eventType);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  // Get the received signature from the headers
  const receivedSignature =
    req.headers.get("X-Up-Authenticity-Signature") || "";

  if (!receivedSignature) {
    return NextResponse.json(
      { error: "Missing X-Up-Authenticity-Signature header." },
      { status: 400 },
    );
  }

  try {
    const webhookSecretKey = await prisma.setting.findUnique({
      where: {
        userId_key: { userId, key: SettingKey.UP_BANK_WEBHOOK_SECRET_KEY },
      },
      select: { value: true },
    });

    if (!webhookSecretKey || !webhookSecretKey.value) {
      return NextResponse.json(
        { error: "Webhook secret key not found for the user." },
        { status: 404 },
      );
    }

    const secretKey = decrypt(webhookSecretKey.value);

    const body = await req.text();

    // Verify the webhook's authenticity
    if (!verifySignature(body, receivedSignature, secretKey)) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 403 },
      );
    }

    const parsedBody = UpBankWebhookPayloadSchema.parse(JSON.parse(body));
    const eventType = parsedBody.data.attributes.eventType;
    const payload = parsedBody.data;

    if (!eventType) {
      return NextResponse.json(
        { error: "Missing eventType in request payload." },
        { status: 400 },
      );
    }

    // Process the webhook event asynchronously
    await handleEvent({ eventType: eventType, payload: payload, userId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

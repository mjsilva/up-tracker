"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function currentUserServer() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("User not found");
  }

  let dbUser;
  dbUser = await prisma.user.findUnique({
    where: { id: clerkUser.id },
  });

  if (!dbUser) {
    if (!clerkUser.firstName || !clerkUser.lastName) {
      throw new Error("user not found and clerk user is incomplete");
    }

    dbUser = await prisma.user.create({
      data: {
        id: clerkUser.id,
        name: clerkUser?.fullName ? clerkUser.fullName : undefined,
        email: clerkUser.emailAddresses[0].emailAddress,
      },
    });
  }

  return dbUser;
}

export async function currentUserServerOrThrow() {
  const user = await currentUserServer();

  if (!user) {
    throw new Error("user not found");
  }

  return user;
}

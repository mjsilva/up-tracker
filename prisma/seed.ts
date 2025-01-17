import { faker } from "@faker-js/faker";
import "../lib/env-config";
import prisma from "@/lib/db";

async function ensureUserExists(userId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    console.log(`User with ID ${userId} not found. Creating user...`);
    await prisma.user.create({
      data: {
        id: userId,
        email: faker.internet.email(),
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          create: [
            {
              key: "UP_BANK_API_KEY",
              value: faker.internet.password(),
            },
            {
              key: "UP_BANK_WEBHOOK_SECRET_KEY",
              value: faker.internet.password(),
            },
          ],
        },
      },
    });
    console.log(`User with ID ${userId} and settings created.`);
  } else {
    console.log(`User with ID ${userId} already exists.`);
  }
}

async function main() {
  console.log("Seeding 1000 transactions for the last 3 months...");

  const userId = process.env.SEED_USER_ID;

  if (!userId) {
    console.error("SEED_USER_ID environment variable is not set.");
    process.exit(1);
  }

  await ensureUserExists(userId);

  for (let i = 0; i < 1000; i++) {
    const transactionType = faker.helpers.arrayElement(["INCOME", "EXPENSE"]);
    const amountValueInCents =
      transactionType === "INCOME"
        ? faker.number.int({ min: 100, max: 100000 }) // Positive for income
        : -faker.number.int({ min: 100, max: 100000 }); // Negative for expense

    const transactionCreatedAt = faker.date.between({
      from: new Date(new Date().setMonth(new Date().getMonth() - 3)), // 3 months ago
      to: new Date(),
    });

    const transactionSettledAt = faker.helpers.maybe(() =>
      faker.date.between({ from: transactionCreatedAt, to: new Date() }),
    );

    // Generate realistic descriptions
    const description = faker.helpers.arrayElement([
      `${faker.company.name()}`,
      `${faker.commerce.department()}`,
      `PAYMENT TO ${faker.company.name().toUpperCase()}`,
    ]);

    await prisma.transaction.create({
      data: {
        status: faker.helpers.arrayElement(["HELD", "SETTLED"]),
        rawText: faker.helpers.maybe(() => faker.lorem.sentence()),
        description,
        message: faker.helpers.maybe(() => faker.word.words(2)),
        amountValueInCents,
        amountCurrencyCode: "AUD",
        cardPurchaseMethod: faker.helpers.arrayElement([
          "ECOMMERCE",
          "CARD_ON_FILE",
          "CARD_PIN",
          "CARD_DETAILS",
          "CONTACTLESS",
          null, // Simulates transactions without this field
        ]),
        cardNumberSuffix: faker.helpers.maybe(() =>
          faker.finance.creditCardNumber().slice(-4),
        ),
        transactionCreatedAt,
        transactionSettledAt,
        upCategory: faker.helpers.maybe(() => faker.commerce.department()),
        upParentCategory: faker.helpers.arrayElement([
          "transport",
          "personal",
          "home",
          "entertainment",
          null,
        ]),
        isTransferBetweenAccounts: faker.datatype.boolean(),
        type: transactionType,
        userId: userId,
      },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

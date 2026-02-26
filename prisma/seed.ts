import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const seed = async () => {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecn.local" },
    update: {},
    create: {
      email: "admin@ecn.local",
      name: "Admin",
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@ecn.local" },
    update: {},
    create: {
      email: "user@ecn.local",
      name: "Demo User",
      password: passwordHash,
      role: "USER",
      isActive: true,
    },
  });

  const categories = [
    { name: "category 1", slug: "category_1" },
    { name: "category 2", slug: "category_2" },
    { name: "category 3", slug: "category_3" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const categoryRows = await prisma.category.findMany();

  await prisma.post.upsert({
    where: { slug: "welcome" },
    update: {},
    create: {
      title: "Welcome",
      slug: "welcome",
      summary: "First seeded post",
      contentJson: {
        blocks: [
          { type: "paragraph", text: "Hello from the ECN API seed." },
        ],
      },
      contentHtml: "<p>Hello from the ECN API seed.</p>",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      authorId: admin.id,
      categories: {
        createMany: {
          data: categoryRows.slice(0, 2).map((category: { id: string }) => ({
            categoryId: category.id,
          })),
        },
      },
      publishedAt: new Date(),
    },
  });
};

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

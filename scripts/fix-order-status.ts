// scripts/fix-order-status.ts
import { prisma } from "@/lib/prisma"; // adjust path to your prisma.ts
import { $Enums } from "@/prisma/generated/prisma";

async function main() {
  const result = await prisma.order.updateMany({
  where: { status: "PREPARING" as any },
  data: { status: "IN_PROGRESS" as any },
});

  console.log(`Updated ${result.count} orders`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

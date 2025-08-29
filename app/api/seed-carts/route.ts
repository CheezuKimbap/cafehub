// app/api/seed-carts/route.ts
import { createCartsForAllCustomers } from "@/app/lib/cartHelper";

export async function GET() {
  const result = await createCartsForAllCustomers();
  return new Response(JSON.stringify(result), { status: 200 });
}

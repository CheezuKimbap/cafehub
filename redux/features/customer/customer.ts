import { Order, Profile } from "@/prisma/generated/prisma";


// Customer type (minimal for orders)

export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profile?: Profile;
  orders?: Order[]; // <-- add this
  currentStamps?: number;
}


import { z } from "zod";

export const createServiceSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2),
  durationMin: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
});

export const bookingSchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().min(1),
  employeeId: z.string().min(1),
  startAt: z.string().datetime(),
  client: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional(),
  }),
});

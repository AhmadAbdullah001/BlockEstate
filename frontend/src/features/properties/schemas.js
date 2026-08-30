import { z } from "zod";
export const propertySchema = z.object({
  title: z.string().min(1),
  price: z.coerce.number().positive(),
});

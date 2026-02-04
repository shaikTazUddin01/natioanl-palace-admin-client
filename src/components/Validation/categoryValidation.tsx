import { z } from "zod";


export const categoryValidation = z.object({
  name: z.string().min(1, "Category name is required"),
  code: z.string().min(1, "Category code is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().optional(),
});
import { z } from "zod";

export const productValidation = z.object({
  name: z.string().trim().min(1, { message: "Product name is required" }),

  image: z.string().trim().url({ message: "Please enter a valid image url" }),

  price: z.coerce.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }),
 

  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters" }),
});

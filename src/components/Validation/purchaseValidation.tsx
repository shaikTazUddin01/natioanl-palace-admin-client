import z from "zod";

export const purchaseValidation = z
  .object({
    supplierName: z.string().min(1, "Supplier name is required"),
    productName: z.string().min(1, "Product name is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    purchasePrice: z.coerce.number().min(0, "Purchase price must be 0 or more"),
    paidAmount: z.coerce.number().min(0, "Paid amount must be 0 or more"),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount === 0 || Boolean(data.paymentMethod), {
    message: "Payment method is required when paid amount is greater than 0",
    path: ["paymentMethod"],
  });

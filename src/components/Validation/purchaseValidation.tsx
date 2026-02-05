import z from "zod";

export const purchaseValidation = z
  .object({
    supplierName: z.string().min(1, "Supplier name is required"),
    productName: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),

    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),

    // ✅ Buying price
    purchasePrice: z.coerce.number().min(0, "Buying price must be 0 or more"),

    // ✅ Selling price
    salePrice: z.coerce.number().min(0, "Selling price must be 0 or more"),

    // ✅ Auto calculated (frontend fills), not required from user input
    totalAmount: z.coerce.number().min(0, "Total amount must be 0 or more").optional(),

    paidAmount: z.coerce.number().min(0, "Paid amount must be 0 or more"),

    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount === 0 || Boolean(data.paymentMethod), {
    message: "Payment method is required when paid amount is greater than 0",
    path: ["paymentMethod"],
  });

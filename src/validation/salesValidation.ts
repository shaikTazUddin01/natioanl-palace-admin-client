import z from "zod";

export const sellValidation = z
  .object({
    date: z.string().min(1, "Date is required"),
    invoiceNo: z.string().min(1, "Invoice number is required"),

    customerName: z.string().min(1, "Customer name is required"),
    customerNumber: z.string().min(1, "Customer Number is required"),

    productName: z.string().min(1, "Product name is required"),

    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),

    totalAmount: z.coerce.number().min(0),
    paidAmount: z.coerce.number().min(0),

    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount <= data.totalAmount, {
    message: "Paid amount cannot exceed total amount",
    path: ["paidAmount"],
  });
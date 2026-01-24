/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect } from "react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";

/* ---------------- Helpers ---------------- */
const generateInvoiceNo = () => {
  const d = new Date();
  return `SAL-${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
};

/* ---------------- Validation ---------------- */
const sellValidation = z
  .object({
    date: z.string().min(1, "Date is required"),
    invoiceNo: z.string().min(1, "Invoice number is required"),

    customerName: z.string().min(1, "Customer name is required"),
    productName: z.string().min(1, "Product name is required"),

    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number().min(0),

    totalAmount: z.coerce.number().min(0),
    paidAmount: z.coerce.number().min(0),

    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount <= data.totalAmount, {
    message: "Paid amount cannot exceed total amount",
    path: ["paidAmount"],
  });

/* ---------------- Auto Calculate ---------------- */
const AutoSellCalc = () => {
  const { watch, setValue } = useFormContext();

  const qty = Number(watch("quantity") || 0);
  const price = Number(watch("unitPrice") || 0);

  useEffect(() => {
    setValue("totalAmount", qty * price);
  }, [qty, price, setValue]);

  return null;
};

/* ---------------- Page ---------------- */
const Page = () => {
  const router = useRouter();

  const handleCreateSell: SubmitHandler<FieldValues> = async (data) => {
    try {
      const dueAmount =
        Number(data.totalAmount) - Number(data.paidAmount);

      console.log("Create Sell Payload:", {
        ...data,
        dueAmount,
      });

      toast.success("Sale created successfully");
      router.push("/sales");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Create New Sell
        </h1>
        <p className="text-slate-500">
          Record a new sales transaction
        </p>
      </div>

      <TDForm
        resolver={zodResolver(sellValidation)}
        onSubmit={handleCreateSell}
        defaultValues={{
          invoiceNo: generateInvoiceNo(),
        }}
      >
        <AutoSellCalc />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <TDInput label="Date" name="date" type="date" required />

          <TDInput
            label="Invoice No (Auto Generated)"
            name="invoiceNo"
            required
          />

          <TDInput
            label="Customer Name"
            name="customerName"
            required
          />

          <TDInput
            label="Product Name"
            name="productName"
            required
          />

          <TDInput
            label="Quantity"
            name="quantity"
            type="number"
            required
          />

          <TDInput
            label="Unit Price"
            name="unitPrice"
            type="number"
            required
          />

          <TDInput
            label="Total Amount (Auto Calculated)"
            name="totalAmount"
            type="number"
            required
          />

          <TDInput
            label="Paid Amount"
            name="paidAmount"
            type="number"
            required
          />

          <TDInput
            label="Note (Optional)"
            name="note"
            placeholder="Any additional info"
          />
        </div>

        {/* Action */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[#390dff] text-white py-3 rounded-3xl font-semibold hover:opacity-90 transition"
          >
            Create Sell
          </button>
        </div>
      </TDForm>
    </div>
  );
};

export default Page;

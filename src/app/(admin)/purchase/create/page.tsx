"use client";

import { FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

/* ---------------- Payment Options ---------------- */

const paymentMethods = [
  { label: "Cash", value: "CASH" },
  { label: "bKash", value: "BKASH" },
  { label: "Nagad", value: "NAGAD" },
  { label: "BANK", value: "BANK" },
];

/* ---------------- Validation ---------------- */

const purchaseValidation = z
  .object({
    supplierName: z.string().min(1, "Supplier name is required"),
    productName: z.string().min(1, "Product name is required"),
    quantity: z.coerce.number().min(1),
    purchasePrice: z.coerce.number().min(0),
    paidAmount: z.coerce.number().min(0),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) =>
      data.paidAmount === 0 || Boolean(data.paymentMethod),
    {
      message: "Payment method is required when paid amount is greater than 0",
      path: ["paymentMethod"],
    }
  );

/* ---------------- Page ---------------- */

const Page = () => {
  const router = useRouter();

  const handleCreatePurchase: SubmitHandler<FieldValues> = async (data) => {
    const totalAmount = data.quantity * data.purchasePrice;
    const dueAmount = totalAmount - data.paidAmount;

    if (dueAmount < 0) {
      toast.error("Paid amount cannot exceed total amount");
      return;
    }

    const payload = {
      supplierName: data.supplierName,
      productName: data.productName,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      totalAmount,
      paidAmount: data.paidAmount,
      dueAmount,
      paymentMethod:
        data.paidAmount > 0 ? data.paymentMethod : null,
      purchaseStatus: dueAmount > 0 ? "DUE" : "PAID",
      note: data.note,
    };

    console.log("Purchase Payload:", payload);

    toast.success(
      dueAmount > 0
        ? "Purchase saved with due"
        : "Purchase saved successfully"
    );

    router.push("/purchase");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          New Purchase
        </h1>
        <p className="text-slate-500">
          Purchase products with cash or mobile payment
        </p>
      </div>

      <TDForm
        resolver={zodResolver(purchaseValidation)}
        onSubmit={handleCreatePurchase}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TDInput
            label="Supplier Name"
            name="supplierName"
            placeholder="Rahman Traders"
            required
          />

          <TDInput
            label="Product Name"
            name="productName"
            placeholder="iPhone 13"
            required
          />

          <TDInput
            label="Quantity"
            name="quantity"
            type="number"
            required
          />

          <TDInput
            label="Purchase Price (per unit)"
            name="purchasePrice"
            type="number"
            required
          />

          <TDInput
            label="Paid Amount"
            name="paidAmount"
            type="number"
            placeholder="0 for full due"
            required
          />

          {/* Payment Method */}
          <TDSelect
            label="Payment Method"
            name="paymentMethod"
            options={paymentMethods}
          />

          <TDInput
            label="Note (Optional)"
            name="note"
            placeholder="Invoice / memo no"
          />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[#390dff] text-white py-3 rounded-3xl font-semibold hover:opacity-90 transition"
          >
            Save Purchase
          </button>
        </div>
      </TDForm>
    </div>
  );
};

export default Page;

"use client";

import { useEffect } from "react";
import { FieldValues, SubmitHandler, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

import { useAddPurchaseMutation } from "@/src/redux/features/purchase/purchaseApi";
import { purchaseValidation } from "@/src/components/Validation/purchaseValidation";
import { paymentMethods } from "@/src/utils/constant";

/* ✅ Auto Total Amount = quantity * purchasePrice */
const AutoTotalAmount = () => {
  const { control, setValue } = useFormContext();

  const quantity = useWatch({ control, name: "quantity" });
  const purchasePrice = useWatch({ control, name: "purchasePrice" });

  useEffect(() => {
    const q = Number(quantity || 0);
    const p = Number(purchasePrice || 0);
    const total = q * p;

    setValue("totalAmount", total); // ✅ auto fill
  }, [quantity, purchasePrice, setValue]);

  return null;
};

const Page = () => {
  const router = useRouter();
  const [addPurchase] = useAddPurchaseMutation();

  const handleCreatePurchase: SubmitHandler<FieldValues> = async (data) => {
    console.log('object-->',data);
    const quantity = Number(data.quantity || 0);
    const purchasePrice = Number(data.purchasePrice || 0);
    const paidAmount = Number(data.paidAmount || 0);

    const totalAmount = quantity * purchasePrice;
    const dueAmount = totalAmount - paidAmount;

    if (dueAmount < 0) {
      toast.error("Paid amount cannot exceed total amount");
      return;
    }

    const payload = {
      supplierName: data.supplierName,
      productName: data.productName,
      category: data.category,
      quantity,
      purchasePrice,
      paidAmount,
      paymentMethod: paidAmount > 0 ? data.paymentMethod : null,
      note: data.note || "",
      totalAmount,
      dueAmount,
      purchaseStatus: dueAmount > 0 ? "DUE" : "PAID",
    };
console.log("data-->",payload);
    const toastId = toast.loading("Saving purchase...");

    try {
      const res = await addPurchase(payload).unwrap();

      if (res?.success) {
        toast.success(
          dueAmount > 0 ? "Purchase saved with due" : "Purchase saved successfully",
          { id: toastId }
        );
        router.push("/purchase");
      } else {
        toast.error(res?.message || "Something went wrong", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">New Purchase</h1>
        <p className="text-slate-500">Purchase products with cash or mobile payment</p>
      </div>

      <TDForm
        resolver={zodResolver(purchaseValidation)}
        onSubmit={handleCreatePurchase}
        defaultValues={{
          totalAmount: 0, // ✅ important default
        }}
      >
        <AutoTotalAmount />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TDInput label="Supplier Name" name="supplierName" placeholder="Rahman Traders" required />

          <TDInput label="Product Name" name="productName" placeholder="iPhone 13" required />

          <TDInput label="Category" name="category" placeholder="Electronics" required />

          <TDInput label="Quantity" name="quantity" type="number" required />

          <TDInput label="Purchase Price (per unit)" name="purchasePrice" type="number" required />

          {/* ✅ Auto field: Total payment amount */}
          <TDInput
            label="Total Amount"
            name="totalAmount"
            type="number"
            
          />

          <TDInput label="Paid Amount" name="paidAmount" type="number" placeholder="0 for full due" required />

          <TDSelect label="Payment Method" name="paymentMethod" options={paymentMethods} />

          <TDInput label="Note (Optional)" name="note" placeholder="Invoice / memo no" />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[#390dff] !text-white py-3 rounded-3xl font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Save Purchase
          </button>
        </div>
      </TDForm>
    </div>
  );
};

export default Page;

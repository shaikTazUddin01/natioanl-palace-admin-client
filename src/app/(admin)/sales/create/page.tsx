/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useMemo } from "react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

import { useAddSaleMutation } from "@/src/redux/features/sales/salesApi";
import { useGetProductsQuery } from "@/src/redux/features/product/productApi";

/* ---------------- Helpers ---------------- */
const generateInvoiceNo = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SAL-${y}${m}${day}-${rand}`;
};

/* ---------------- Validation ---------------- */
const sellValidation = z
  .object({
    date: z.string().min(1, "Date is required"),
    invoiceNo: z.string().min(1, "Invoice number is required"),

    customerName: z.string().min(1, "Customer name is required"),
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

/* ---------------- Auto Calculate Total ---------------- */
const AutoSellCalc = () => {
  const { watch, setValue } = useFormContext();

  const qty = Number(watch("quantity") || 0);
  const price = Number(watch("unitPrice") || 0);

  useEffect(() => {
    setValue("totalAmount", qty * price);
  }, [qty, price, setValue]);

  return null;
};

/* ---------------- Auto Set Unit Price From Product ---------------- */
const AutoUnitPriceFromProduct = ({
  products,
}: {
  products: any[];
}) => {
  const { watch, setValue } = useFormContext();
  const productName = watch("productName");

  useEffect(() => {
    if (!productName) return;

    const found = products?.find((p: any) => p?.name === productName);
    if (!found) return;

    // ✅ salePrice কে unitPrice হিসেবে ধরলাম
    // আপনার product field যদি অন্য নামে থাকে (price / sellingPrice) তাহলে এখানে change করবেন
    const price = Number(found?.salePrice ?? 0);

    // unitPrice empty বা 0 থাকলে auto set
    setValue("unitPrice", price);
  }, [productName, products, setValue]);

  return null;
};

/* ---------------- Page ---------------- */
const Page = () => {
  const router = useRouter();
  const [addSale] = useAddSaleMutation();

  // ✅ get all products
  const { data: productRes, isLoading: productLoading } = useGetProductsQuery(undefined);

  const rawProducts = productRes?.data ?? productRes ?? [];
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  // ✅ dropdown options
  const productOptions = useMemo(() => {
    return products.map((p: any) => ({
      label: `${p?.name ?? "Unnamed"} (${p?.sku ?? "No SKU"})`,
      value: p?.name, // productName field এ name save হচ্ছে
    }));
  }, [products]);

  const handleCreateSell: SubmitHandler<FieldValues> = async (data) => {
    const toastId = toast.loading("Creating sell...");

    try {
      const totalAmount = Number(data.totalAmount || 0);
      const paidAmount = Number(data.paidAmount || 0);

      if (paidAmount > totalAmount) {
        toast.error("Paid amount cannot exceed total amount", { id: toastId });
        return;
      }

      const payload = {
        date: data.date,
        invoiceNo: data.invoiceNo,

        customerName: data.customerName,
        productName: data.productName,

        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),

        totalAmount,
        paidAmount,

        note: data.note || "",
      };

      const res = await addSale(payload).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Sell created successfully", { id: toastId });
        router.push("/sales");
      } else {
        toast.error(res?.message || "Something went wrong", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl  p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Create New Sell</h1>
        <p className="text-slate-500">Record a new sales transaction</p>
      </div>

      <TDForm
        resolver={zodResolver(sellValidation)}
        onSubmit={handleCreateSell}
        defaultValues={{
          date: new Date().toISOString().slice(0, 10),
          invoiceNo: generateInvoiceNo(),
          totalAmount: 0,
          paidAmount: 0,
        }}
      >
        <AutoSellCalc />
        <AutoUnitPriceFromProduct products={products} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <TDInput label="Date" name="date" type="date" required />

          <TDInput label="Invoice No (Auto Generated)" name="invoiceNo" required />

          <TDInput label="Customer Name" name="customerName" required />

          {/* ✅ Product Dropdown */}
          <TDSelect
            label="Product"
            name="productName"
            options={productOptions}
            required
            disabled={productLoading}
          />

          <TDInput label="Quantity" name="quantity" type="number" required />

          <TDInput label="Unit Price" name="unitPrice" type="number" required />

          <TDInput
            label="Total Amount (Auto Calculated)"
            name="totalAmount"
            type="number"
            required
          />

          <TDInput label="Paid Amount" name="paidAmount" type="number" required />

          <TDInput label="Note (Optional)" name="note" placeholder="Any additional info" />
        </div>

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

/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

/* ---------------- Demo Category JSON ---------------- */
const categoryOptions = [
  { label: "Electronics", value: "electronics" },
  { label: "Grocery", value: "grocery" },
  { label: "Fashion", value: "fashion" },
  { label: "Stationary", value: "stationary" },
];

/* ---------------- Validation ---------------- */
const productValidation = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
});

/* ---------------- SKU Generator ---------------- */
const generateSKU = (name: string, category: string) => {
  if (!name || !category) return "";
  return `${category.substring(0, 4).toUpperCase()}-${name
    .trim()
    .replace(/\s+/g, "-")
    .toUpperCase()}`;
};

/* ---------------- Auto SKU Component ---------------- */
const AutoSKU = () => {
  const { watch, setValue } = useFormContext();

  const name = watch("name");
  const category = watch("category");

  useEffect(() => {
    const sku = generateSKU(name, category);
    if (sku) {
      setValue("sku", sku);
    }
  }, [name, category, setValue]);

  return null;
};

/* ---------------- Page ---------------- */
const Page = () => {
  const router = useRouter();

  const handleCreateProduct: SubmitHandler<FieldValues> = async (data) => {
    try {
      console.log("Create Product Payload:", data);

      // 🔗 later API call here
      toast.success("Product created successfully");
      router.push("/products");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Create New Product
        </h1>
        <p className="text-slate-500">
          Add product details to manage inventory
        </p>
      </div>

      <TDForm
        resolver={zodResolver(productValidation)}
        onSubmit={handleCreateProduct}
      >
        {/* Auto SKU logic */}
        <AutoSKU />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <TDInput label="Product Name" name="name" required />

          <TDSelect
            label="Category"
            name="category"
            options={categoryOptions}
            required
          />

          <TDInput
            label="SKU (Auto Generated)"
            name="sku"
            required
          />

          <TDInput
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            required
          />

          <TDInput
            label="Sale Price"
            name="salePrice"
            type="number"
            required
          />

          <TDInput
            label="Opening Quantity"
            name="quantity"
            type="number"
            required
          />
        </div>

        {/* Action */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[#390dff] text-white py-3 rounded-3xl font-semibold hover:opacity-90 transition"
          >
            Create Product
          </button>
        </div>
      </TDForm>
    </div>
  );
};

export default Page;

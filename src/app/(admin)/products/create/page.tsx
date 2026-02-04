/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";
import { useAddProductMutation } from "@/src/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/src/redux/features/category/categoryApi";
import { productValidation } from "@/src/validation/productValidation";


/* ---------------- SKU Generator ---------------- */
const generateSKU = (name: string, category: string) => {
  if (!name || !category) return "";

  const time = Date.now().toString().slice(-6); // last 6 digits of timestamp

  return `${category.substring(0, 4).toUpperCase()}-${name
    .trim()
    .replace(/\s+/g, "-")
    .toUpperCase()}-${time}`;
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
  const [addNewProduct] = useAddProductMutation();
  // ✅ get categories from backend
  const { data: categoryRes, isLoading: catLoading } =
    useGetCategoriesQuery(undefined);

  const rawCategories = categoryRes?.data ?? categoryRes ?? [];

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(rawCategories)) return [];

    // only active categories (optional)
    const active = rawCategories.filter((c: any) => c?.status !== "inactive");

    return active.map((c: any) => ({
      // label what user sees
      label: `${c?.name ?? "Unnamed"} (${c?.code ?? "-"})`,
      // value what you store in product.category
      // ✅ choose one:
      // value: c?._id,  // if you want to store category id
      value: c?.name, // if you want to store category name (string)
    }));
  }, [rawCategories]);

  const handleCreateProduct: SubmitHandler<FieldValues> = async (data) => {
    const toastId = toast.loading("Creating product...");

    try {
      console.log("Create Product Payload:", data);

      const res = await addNewProduct(data).unwrap();

      if (res?.data) {
        toast.success("Product created successfully", {
          id: toastId,
        });
        router.push("/products");
      } else {
        toast.error("Something went wrong", {
          id: toastId,
        });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong", {
        id: toastId,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 ">
      {/* Header */}
      <div className="mb-8 text-center ">
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
          <TDSelect
            label="Category"
            name="category"
            options={categoryOptions}
            required
          />

          <TDInput label="Product Name" name="name" required />

          <TDInput label="SKU (Auto Generated)" name="sku" required />

          <TDInput
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            required
          />

          <TDInput label="Sale Price" name="salePrice" type="number" required />

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
            className="w-full bg-[#390dff] !text-white py-3 rounded-3xl font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Create Product
          </button>
        </div>
      </TDForm>
    </div>
  );
};

export default Page;

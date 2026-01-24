/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

/* ---------------- Demo JSON ---------------- */
const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

/* ---------------- Validation ---------------- */
const categoryValidation = z.object({
  name: z.string().min(1, "Category name is required"),
  code: z.string().min(1, "Category code is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().optional(),
});

/* ---------------- Page ---------------- */
const Page = () => {
  const router = useRouter();

  const handleCreateCategory: SubmitHandler<FieldValues> = async (data) => {
    try {
      console.log("Create Category Payload:", data);

      // 🔗 later API call here
      toast.success("Category created successfully");
      router.push("/categories");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Create New Category
        </h1>
        <p className="text-slate-500">
          Add category details to organize your products
        </p>
      </div>

      <TDForm
        resolver={zodResolver(categoryValidation)}
        onSubmit={handleCreateCategory}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <TDInput label="Category Name" name="name" required />

          <TDInput
            label="Category Code"
            name="code"
            required
            placeholder="e.g. ELEC"
          />

          <TDSelect
            label="Status"
            name="status"
            options={statusOptions}
            required
          />

          <TDInput
            label="Description (Optional)"
            name="description"
            placeholder="Short description of the category"
          />
        </div>

        {/* Action */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[#390dff] text-white py-3 rounded-3xl font-semibold hover:opacity-90 transition"
          >
            Create Category
          </button>
        </div>
      </TDForm>
    </div>
  );
};

export default Page;

"use client";

import { useState } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { FieldValues, SubmitHandler } from "react-hook-form";



import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/src/redux/features/category/categoryApi";
import { TCategoryRow } from "@/src/types";
import CategoryTable from "@/src/components/pages/categories/CategoryTable";
import UpdateCategoryModal from "@/src/components/pages/categories/UpdateCategoryModel";

const Page = () => {
  const router = useRouter();

  const { data, isLoading, isFetching, isError } =
    useGetCategoriesQuery(undefined);

  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const rawCategories = data?.data ?? data ?? [];

  const categoryData: TCategoryRow[] = Array.isArray(rawCategories)
    ? rawCategories.map((c: any) => ({
        key: c?._id || c?.id || c?.code || crypto.randomUUID(),
        _id: c?._id || c?.id,
        name: c?.name ?? "-",
        code: c?.code ?? "-",
        description: c?.description ?? "",
        status: (c?.status ?? "active") as "active" | "inactive",
      }))
    : [];

  // ---------------- Delete ----------------
  const handleDelete = async (id?: string) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading("Deleting category...");

    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete category", {
        id: toastId,
      });
    }
  };

  // ---------------- Update Modal ----------------
  const openUpdateModal = (row: TCategoryRow) => {
    const raw =
      Array.isArray(rawCategories) &&
      rawCategories.find((c: any) => (c?._id || c?.id) === row._id);

    setSelected(
      raw || {
        _id: row._id,
        name: row.name,
        code: row.code,
        status: row.status,
        description: row.description,
      }
    );

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleUpdate: SubmitHandler<FieldValues> = async (formData) => {
    const id = selected?._id || selected?.id;
    if (!id) return;

    const toastId = toast.loading("Updating category...");

    try {
      await updateCategory({ id, ...formData }).unwrap();
      toast.success("Category updated successfully", { id: toastId });
      closeModal();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update category", {
        id: toastId,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Manage Categories
          </h1>
          <p className="text-slate-500">View, edit and manage your categories</p>
        </div>

        <Button type="primary" onClick={() => router.push("/categories/create")}>
          Add Category
        </Button>
      </div>

      {/* Error */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load categories. Please try again.
        </div>
      ) : (
        <CategoryTable
          data={categoryData}
          loading={isLoading || isFetching}
          onEdit={openUpdateModal}
          onDelete={handleDelete}
        />
      )}

      <UpdateCategoryModal
        open={isModalOpen}
        selected={selected}
        onClose={closeModal}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default Page;

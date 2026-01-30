"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/src/redux/features/category/categoryApi";

/* ---------------- Status Options ---------------- */
const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

/* ---------------- Validation (same as create) ---------------- */
const categoryValidation = z.object({
  name: z.string().min(1, "Category name is required"),
  code: z.string().min(1, "Category code is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().optional(),
});

type TCategoryRow = {
  key: string;
  _id?: string;
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
};

const Page = () => {
  const router = useRouter();

  const { data, isLoading, isFetching, isError } = useGetCategoriesQuery(undefined);
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // ✅ adjust based on your API response shape
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
      // ✅ your RTK update signature: updateCategory({ id, ...data })
      await updateCategory({ id, ...formData }).unwrap();

      toast.success("Category updated successfully", { id: toastId });
      closeModal();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update category", {
        id: toastId,
      });
    }
  };

  const columns: ColumnsType<TCategoryRow> = useMemo(
    () => [
      {
        title: "Category Name",
        dataIndex: "name",
        key: "name",
        fixed: "left",
      },
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (text) => text || "-",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: "active" | "inactive") => (
          <Tag color={status === "active" ? "green" : "red"}>
            {status === "active" ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        title: "Action",
        key: "action",
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              type="primary"
              onClick={() => openUpdateModal(record)}
            />
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record._id)}
            />
          </Space>
        ),
      },
    ],
    [rawCategories]
  );

  const defaultValues = selected
    ? {
        name: selected?.name ?? "",
        code: selected?.code ?? "",
        status: selected?.status ?? "active",
        description: selected?.description ?? "",
      }
    : undefined;

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
        <Table
          columns={columns}
          dataSource={categoryData}
          loading={isLoading || isFetching}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Update Modal */}
      <Modal
        title="Update Category"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
      >
        {selected ? (
          <div className="pt-2">
            {/* 
              NOTE:
              TDForm যদি defaultValues support করে: perfect.
              যদি না করে—TDForm.tsx দিলে আমি setValue দিয়ে prefill fix করে দিব।
            */}
            <TDForm
              key={selected?._id || selected?.id}
              resolver={zodResolver(categoryValidation)}
              onSubmit={handleUpdate}
              defaultValues={defaultValues as any}
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

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={closeModal}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Update Category
                </Button>
              </div>
            </TDForm>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Page;

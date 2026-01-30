"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import Swal from "sweetalert2";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/src/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/src/redux/features/category/categoryApi";

/* ---------------- Validation (same as create) ---------------- */
const productValidation = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
});

type TProductRow = {
  key: string;
  _id?: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
};

const Page = () => {
  const { data, isLoading, isFetching, isError } = useGetProductsQuery(undefined);
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
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
      value: c?.name,   // if you want to store category name (string)
    }));
  }, [rawCategories]);
  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null); // store raw product

  // ✅ adjust depending on your API response shape
  const rawProducts = data?.data ?? data ?? [];

  const productData: TProductRow[] = Array.isArray(rawProducts)
    ? rawProducts.map((p: any) => ({
        key: p?._id || p?.id || p?.sku || crypto.randomUUID(),
        _id: p?._id || p?.id,
        name: p?.name ?? "-",
        sku: p?.sku ?? "-",
        category:
          typeof p?.category === "string"
            ? p.category
            : p?.category?.name ?? "-",
        purchasePrice: Number(p?.purchasePrice ?? 0),
        salePrice: Number(p?.salePrice ?? 0),
        stock: Number(p?.quantity ?? p?.stock ?? 0),
      }))
    : [];

  // ---------------- Delete Handler ----------------
  const handleDelete = async (id?: string) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading("Deleting product...");

    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete product", {
        id: toastId,
      });
    }
  };

  // ---------------- Update Modal Open ----------------
  const openUpdateModal = (productRow: TProductRow) => {
    const raw = Array.isArray(rawProducts)
      ? rawProducts.find((p: any) => (p?._id || p?.id) === productRow._id)
      : null;

    // fallback: build from row if raw not found
    setSelected(
      raw || {
        _id: productRow._id,
        name: productRow.name,
        category: productRow.category,
        sku: productRow.sku,
        purchasePrice: productRow.purchasePrice,
        salePrice: productRow.salePrice,
        quantity: productRow.stock,
      }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  // ---------------- Update Submit ----------------
  const handleUpdate: SubmitHandler<FieldValues> = async (formData) => {
    const id = selected?._id || selected?.id;
    if (!id) return;

    const toastId = toast.loading("Updating product...");

    try {
      // ✅ your RTK updateProduct expects: updateProduct({ id, ...data })
      // so we call it like this:
      await updateProduct({ id, ...formData }).unwrap();

      toast.success("Product updated successfully", { id: toastId });
      closeModal();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update product", {
        id: toastId,
      });
    }
  };

  // ✅ columns must be inside component (need handlers + record)
  const columns: ColumnsType<TProductRow> = useMemo(
    () => [
      {
        title: "Product Name",
        dataIndex: "name",
        key: "name",
        fixed: "left",
      },
      {
        title: "SKU",
        dataIndex: "sku",
        key: "sku",
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Purchase Price",
        dataIndex: "purchasePrice",
        key: "purchasePrice",
        render: (price) => `৳ ${price}`,
      },
      {
        title: "Sale Price",
        dataIndex: "salePrice",
        key: "salePrice",
        render: (price) => `৳ ${price}`,
      },
      {
        title: "Stock",
        dataIndex: "stock",
        key: "stock",
        render: (stock) => (
          <Tag color={stock <= 5 ? "red" : "green"}>{stock}</Tag>
        ),
      },
      {
        title: "Status",
        key: "status",
        render: (_, record) => (
          <Tag color={record.stock <= 5 ? "volcano" : "blue"}>
            {record.stock <= 5 ? "Low Stock" : "In Stock"}
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
    [rawProducts]
  );

  // default values for update form (prefill)
  const updateDefaultValues = selected
    ? {
        name: selected?.name ?? "",
        category: selected?.category ?? "",
        sku: selected?.sku ?? "",
        purchasePrice: selected?.purchasePrice ?? 0,
        salePrice: selected?.salePrice ?? 0,
        quantity: selected?.quantity ?? selected?.stock ?? 0,
      }
    : undefined;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Products</h1>
          <p className="text-slate-500">View, edit and manage your products</p>
        </div>

        {/* ✅ Link fix: use href (not rel) */}
        <Link href="/products/create">
          <Button type="primary">Add Product</Button>
        </Link>
      </div>

      {/* Error state */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load products. Please try again.
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={productData}
          loading={isLoading || isFetching}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* ✅ Update Modal */}
      <Modal
        title="Update Product"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
      >
        {selected ? (
          <div className="pt-2">
            {/* 
              NOTE:
              TDForm যদি defaultValues support করে, এটা best.
              যদি না করে, বলো—আমি setValue দিয়ে prefill version দিব।
            */}
            <TDForm
              key={selected?._id || selected?.id} // ✅ reset form when new product selected
              resolver={zodResolver(productValidation)}
              onSubmit={handleUpdate}
              defaultValues={updateDefaultValues as any}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <TDInput label="Product Name" name="name" required />

                <TDSelect
                  label="Category"
                  name="category"
                  options={categoryOptions}
                  required
                />

                {/* SKU usually shouldn't change; keep editable if you want */}
                <TDInput label="SKU" name="sku" required />

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
                  label="Quantity"
                  name="quantity"
                  type="number"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={closeModal}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Update Product
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

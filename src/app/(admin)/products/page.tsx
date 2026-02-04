"use client";

import { useMemo, useState } from "react";
import { Table } from "antd";
import Swal from "sweetalert2";
import { toast } from "sonner";

import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/src/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/src/redux/features/category/categoryApi";
import ManageHeader from "@/src/components/pages/products/ManagaHeader";
import ProductTable from "@/src/components/pages/products/ProductTable";
import UpdateProductModal from "@/src/components/pages/products/UpdateProductModal";


export type TProductRow = {
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

  const { data: categoryRes } = useGetCategoriesQuery(undefined);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const rawProducts = data?.data ?? data ?? [];
  const rawCategories = categoryRes?.data ?? categoryRes ?? [];

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(rawCategories)) return [];
    const active = rawCategories.filter((c: any) => c?.status !== "inactive");

    return active.map((c: any) => ({
      label: `${c?.name ?? "Unnamed"} (${c?.code ?? "-"})`,
      value: c?.name, // তোমার আগের মতো string
    }));
  }, [rawCategories]);

  const productData: TProductRow[] = Array.isArray(rawProducts)
    ? rawProducts.map((p: any) => ({
        key: p?._id || p?.id || p?.sku || crypto.randomUUID(),
        _id: p?._id || p?.id,
        name: p?.name ?? "-",
        sku: p?.sku ?? "-",
        category: typeof p?.category === "string" ? p.category : p?.category?.name ?? "-",
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
      toast.error(error?.data?.message || "Failed to delete product", { id: toastId });
    }
  };

  // ---------------- Update Modal Open ----------------
  const openUpdateModal = (productRow: TProductRow) => {
    const raw = Array.isArray(rawProducts)
      ? rawProducts.find((p: any) => (p?._id || p?.id) === productRow._id)
      : null;

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
  const handleUpdate = async (formData: any) => {
    const id = selected?._id || selected?.id;
    if (!id) return;

    const toastId = toast.loading("Updating product...");

    try {
      await updateProduct({ id, ...formData }).unwrap();
      toast.success("Product updated successfully", { id: toastId });
      closeModal();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update product", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <ManageHeader />

      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load products. Please try again.
        </div>
      ) : (
        <ProductTable
          data={productData}
          loading={isLoading || isFetching}
          onEdit={openUpdateModal}
          onDelete={handleDelete}
        />
      )}

      <UpdateProductModal
        open={isModalOpen}
        selected={selected}
        onClose={closeModal}
        onSubmit={handleUpdate}
        categoryOptions={categoryOptions}
      />
    </div>
  );
};

export default Page;

"use client";

import React, { useMemo } from "react";
import { Modal, Button } from "antd";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

const productValidation = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
});

type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  categoryOptions: { label: string; value: string }[];
};

const UpdateProductModal: React.FC<Props> = ({ open, selected, onClose, onSubmit, categoryOptions }) => {
  const defaultValues = useMemo(() => {
    if (!selected) return undefined;

    return {
      name: selected?.name ?? "",
      category: selected?.category ?? "",
      sku: selected?.sku ?? "",
      purchasePrice: selected?.purchasePrice ?? 0,
      salePrice: selected?.salePrice ?? 0,
      quantity: selected?.quantity ?? selected?.stock ?? 0,
    };
  }, [selected]);

  const handleUpdate: SubmitHandler<FieldValues> = async (formData) => {
    await onSubmit(formData);
  };

  return (
    <Modal title="Update Product" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      {selected ? (
        <div className="pt-2">
          <TDForm
            key={selected?._id || selected?.id}
            resolver={zodResolver(productValidation)}
            onSubmit={handleUpdate}
            defaultValues={defaultValues as any}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <TDInput label="Product Name" name="name" required />

              <TDSelect label="Category" name="category" options={categoryOptions} required />

              <TDInput label="SKU" name="sku" required />

              <TDInput label="Purchase Price" name="purchasePrice" type="number" required />
              <TDInput label="Sale Price" name="salePrice" type="number" required />
              <TDInput label="Quantity" name="quantity" type="number" required />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Product
              </Button>
            </div>
          </TDForm>
        </div>
      ) : null}
    </Modal>
  );
};

export default UpdateProductModal;

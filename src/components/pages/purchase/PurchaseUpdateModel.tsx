"use client";

import { Modal, Button } from "antd";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";
import { paymentMethods, purchaseValidation } from "@/src/schema/purchase.schema";



type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
  onSubmit: SubmitHandler<FieldValues>;
};

const PurchaseUpdateModal = ({ open, selected, onClose, onSubmit }: Props) => {
  const defaultValues = selected
    ? {
        supplierName: selected?.supplierName ?? "",
        productName: selected?.productName ?? "",
        quantity: selected?.quantity ?? 1,
        purchasePrice: selected?.purchasePrice ?? 0,
        paidAmount: selected?.paidAmount ?? 0,
        paymentMethod: selected?.paymentMethod ?? undefined,
        note: selected?.note ?? "",
      }
    : undefined;

  return (
    <Modal
      title="Update Purchase"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {selected ? (
        <div className="pt-2">
          <TDForm
            key={selected?._id || selected?.id}
            resolver={zodResolver(purchaseValidation)}
            onSubmit={onSubmit}
            defaultValues={defaultValues as any}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <TDInput label="Supplier Name" name="supplierName" required />
              <TDInput label="Product Name" name="productName" required />
              <TDInput label="Quantity" name="quantity" type="number" required />
              <TDInput
                label="Purchase Price (per unit)"
                name="purchasePrice"
                type="number"
                required
              />
              <TDInput label="Paid Amount" name="paidAmount" type="number" required />

              <TDSelect
                label="Payment Method"
                name="paymentMethod"
                options={paymentMethods}
              />

              <TDInput label="Note (Optional)" name="note" />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Purchase
              </Button>
            </div>
          </TDForm>
        </div>
      ) : null}
    </Modal>
  );
};

export default PurchaseUpdateModal;

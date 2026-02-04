"use client";

import { Button, Modal } from "antd";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";
import { TSupplierDueRow } from "@/src/types";
import { paymentMethods } from "@/src/utils/constant";



const dueValidation = z
  .object({
    paidAmount: z.coerce.number().min(0, "Paid amount must be 0 or more"),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount === 0 || Boolean(data.paymentMethod), {
    message: "Payment method is required when paid amount is greater than 0",
    path: ["paymentMethod"],
  });

type Props = {
  open: boolean;
  onClose: () => void;
  selected: TSupplierDueRow | null;
  onSubmit: SubmitHandler<FieldValues>;
};

export default function SupplierDuePaymentModal({ open, onClose, selected, onSubmit }: Props) {
  const defaultValues = selected
    ? {
        paidAmount: selected?.dueAmount?? 0,
        paymentMethod: selected?.paymentMethod ?? undefined,
        note: selected?.note ?? "",
      }
    : undefined;

  return (
    <Modal title="Update Due Payment" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      {selected ? (
        <div className="pt-2">
          <TDForm
            key={selected._id}
            resolver={zodResolver(dueValidation)}
            onSubmit={onSubmit}
            defaultValues={defaultValues as any}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <TDInput label="Paid Amount" name="paidAmount" type="number" required />

              <TDSelect label="Payment Method" name="paymentMethod" options={paymentMethods} />

              <TDInput label="Note (Optional)" name="note" placeholder="Any note" />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Payment
              </Button>
            </div>
          </TDForm>
        </div>
      ) : null}
    </Modal>
  );
}

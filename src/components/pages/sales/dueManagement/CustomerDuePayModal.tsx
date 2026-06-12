"use client";

import { Modal, Button } from "antd";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

import { PaymentMethod, TCustomerDueRow } from "@/src/types";

const paymentValidation = z.object({
  amount: z.coerce.number().min(1, "Amount is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onOk: (data: any) => void;

  selected: TCustomerDueRow | null;

  payAmount: number;
  payMethod: PaymentMethod | undefined;
};

export default function CustomerDuePayModal({
  open,
  onClose,
  onOk,
  selected,
  payAmount,
  payMethod,
}: Props) {
  const handleSubmit: SubmitHandler<FieldValues> = async (data) => {
    onOk(data);
  };

  return (
    <Modal
      title="Receive Payment"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {selected ? (
        <div className="pt-2">
          <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Customer:
              <span className="ml-2 font-semibold text-slate-900">
                {selected.customerName}
              </span>
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Invoice:
              <span className="ml-2 font-semibold text-slate-900">
                {selected.invoiceNo}
              </span>
            </p>

            <p className="mt-2 text-sm">
              Due Amount:
              <span className="ml-2 font-bold text-red-600">
                ৳ {selected.dueAmount.toLocaleString()}
              </span>
            </p>
          </div>

          <TDForm
            resolver={zodResolver(paymentValidation)}
            onSubmit={handleSubmit}
            defaultValues={{
              amount: payAmount || selected.dueAmount,
              paymentMethod: payMethod,
            }}
          >
            <div className="grid grid-cols-1 gap-5">
              <TDInput
                label="Payment Amount"
                name="amount"
                type="number"
                required
              />

              <TDSelect
                label="Payment Method"
                name="paymentMethod"
                required
                options={[
                  { label: "Cash", value: "CASH" },
                  { label: "Bank", value: "BANK" },
                  { label: "Bkash", value: "BKASH" },
                  { label: "Nagad", value: "NAGAD" },
                ]}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose}>Cancel</Button>

              <Button type="primary" htmlType="submit">
                Receive Payment
              </Button>
            </div>
          </TDForm>
        </div>
      ) : null}
    </Modal>
  );
}
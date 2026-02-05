"use client";

import { PaymentMethod, TCustomerDueRow } from "@/src/types";
import { Input, Modal, Select } from "antd";


type Props = {
  open: boolean;
  onClose: () => void;
  onOk: () => void;

  selected: TCustomerDueRow | null;

  payAmount: number;
  setPayAmount: (v: number) => void;

  payMethod: PaymentMethod | undefined;
  setPayMethod: (v: PaymentMethod | undefined) => void;
};

export default function CustomerDuePayModal({
  open,
  onClose,
  onOk,
  selected,
  payAmount,
  setPayAmount,
  payMethod,
  setPayMethod,
}: Props) {
  return (
    <Modal
      title="Receive Payment"
      open={open}
      onCancel={onClose}
      onOk={onOk}
      okText="Receive"
      destroyOnHidden
    >
      {selected ? (
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            <div>
              <strong>{selected.customerName}</strong> • Invoice{" "}
              <strong>{selected.invoiceNo}</strong>
            </div>
            <div>
              Due:{" "}
              <strong className="text-red-600">
                ৳ {selected.dueAmount.toLocaleString()}
              </strong>
            </div>
          </div>

          <Input
            type="number"
            min={1}
            max={selected.dueAmount}
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            placeholder="Payment Amount"
          />

          <Select
            className="w-full"
            placeholder="Payment Method"
            value={payMethod}
            onChange={(v) => setPayMethod(v)}
            options={[
              { label: "Cash", value: "CASH" },
              { label: "Bank", value: "BANK" },
              { label: "Bkash", value: "BKASH" },
              { label: "Nagad", value: "NAGAD" },
            ]}
          />
        </div>
      ) : null}
    </Modal>
  );
}

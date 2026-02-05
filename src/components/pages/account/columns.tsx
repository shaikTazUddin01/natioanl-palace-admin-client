import React from "react";
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PaymentRow } from "@/src/types";

export const accountColumns: ColumnsType<PaymentRow> = [
  
  {
    title: "Customer / Supplier",
    dataIndex: "partyName",
    key: "partyName",
    fixed: "left",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (t) =>
      t === "SALE" ? <Tag color="green">SALE</Tag> : <Tag color="blue">PURCHASE</Tag>,
  },
  {
    title: "Invoice No",
    dataIndex: "invoiceNo",
    key: "invoiceNo",
    render: (v) => <strong>{v}</strong>,
  },
  { title: "Date", dataIndex: "date", key: "date" },
  {
    title: "Paid Amount",
    dataIndex: "amount",
    key: "amount",
    render: (v) => `৳ ${Number(v).toLocaleString()}`,
  },
  {
    title: "Due",
    dataIndex: "due",
    key: "due",
    render: (v) => (
      <Tag color={Number(v) > 0 ? "volcano" : "green"}>
        ৳ {Number(v).toLocaleString()}
      </Tag>
    ),
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
    render: (m) => (m ? <Tag>{m}</Tag> : <Tag color="red">DUE</Tag>),
  },
  {
    title: "Note",
    dataIndex: "note",
    key: "note",
    ellipsis: true,
    render: (n) => n || "-",
  },
];

import React from "react";
import { Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { TCustomerDueRow, TDueStatus } from "@/src/types";


export const createCustomerDueColumns = (
  onView: (row: TCustomerDueRow) => void,
  onPay: (row: TCustomerDueRow) => void
): ColumnsType<TCustomerDueRow> => [
  {
    title: "Customer",
    dataIndex: "customerName",
    key: "customerName",
    fixed: "left",
  },
  // {
  //   title: "Phone",
  //   dataIndex: "customerNumber",
  //   key: "customerNumber"
  // },
  {
    title: "Invoice No",
    dataIndex: "invoiceNo",
    key: "invoiceNo"
  },
  { title: "Date", dataIndex: "date", key: "date" },
  {
    title: "Total",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (amount) => `৳ ${Number(amount).toLocaleString()}`,
  },
  {
    title: "Paid",
    dataIndex: "paidAmount",
    key: "paidAmount",
    render: (amount) => `৳ ${Number(amount).toLocaleString()}`,
  },
  {
    title: "Due",
    dataIndex: "dueAmount",
    key: "dueAmount",
    render: (amount) => (
      <Tag color={Number(amount) > 0 ? "volcano" : "green"}>
        ৳ {Number(amount).toLocaleString()}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: TDueStatus) => {
      const color =
        status === "Paid"
          ? "green"
          : status === "Partial"
          ? "gold"
          : status === "Overdue"
          ? "red"
          : "blue";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    render: (_, record) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => onView(record)} />
        <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => onPay(record)} />
      </Space>
    ),
  },
];

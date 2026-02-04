"use client";

import { Button, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { TDueStatus, TSupplierDueRow } from "@/src/types";


type Props = {
  data: TSupplierDueRow[];
  loading: boolean;

  onView: (row: TSupplierDueRow) => void;
  onPayment: (row: TSupplierDueRow) => void;
  onDelete: (id?: string) => void;
};

export default function SupplierDueTable({ data, loading, onView, onPayment, onDelete }: Props) {
  const columns: ColumnsType<TSupplierDueRow> = [
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      fixed: "left",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (v) => v || "-",
    },
    {
      title: "Invoice",
      dataIndex: "purchaseInvoiceNo",
      key: "purchaseInvoiceNo",
      render: (v) => <strong>{v}</strong>,
    },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      key: "dueAmount",
      render: (v) => <Tag color="volcano">৳ {Number(v).toLocaleString()}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: TDueStatus) => {
        const color =
          s === "Paid"
            ? "green"
            : s === "Partial"
            ? "gold"
            : s === "Overdue"
            ? "red"
            : "blue";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => onView(record)} />
          <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => onPayment(record)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => onDelete(record._id)} />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1100 }}
      pagination={{ pageSize: 10 }}
    />
  );
}

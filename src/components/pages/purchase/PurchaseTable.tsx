"use client";

import { useMemo } from "react";
import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { PaymentStatus, PurchaseRow } from "@/src/types";



type Props = {
  data: PurchaseRow[];
  loading?: boolean;
  onView: (row: PurchaseRow) => void;
  onEdit: (row: PurchaseRow) => void;
  onDelete: (id?: string) => void;
};

const PurchaseTable = ({ data, loading, onView, onEdit, onDelete }: Props) => {
  const columns: ColumnsType<PurchaseRow> = useMemo(
    () => [
      {
        title: "Invoice No",
        dataIndex: "invoiceNo",
        key: "invoiceNo",
        fixed: "left",
      },
      {
        title: "Supplier",
        dataIndex: "supplierName",
        key: "supplierName",
      },
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
      },
      {
        title: "Items",
        dataIndex: "totalItems",
        key: "totalItems",
        render: (items) => <Tag>{items}</Tag>,
      },
      {
        title: "Total Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (amount) => `৳ ${amount}`,
      },
      {
        title: "Paid",
        dataIndex: "paidAmount",
        key: "paidAmount",
        render: (amount) => `৳ ${amount}`,
      },
      {
        title: "Due",
        dataIndex: "dueAmount",
        key: "dueAmount",
        render: (amount) => (
          <Tag color={amount > 0 ? "volcano" : "green"}>৳ {amount}</Tag>
        ),
      },
      {
        title: "Payment Status",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        render: (status: PaymentStatus) => {
          const color =
            status === "Paid" ? "green" : status === "Partial" ? "gold" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      },
      {
        title: "Note",
        dataIndex: "note",
        key: "note",
        ellipsis: true,
        render: (note) => note || "-",
      },
      {
        title: "Action",
        key: "action",
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EyeOutlined />} onClick={() => onView(record)} />
            <Button
              size="small"
              icon={<EditOutlined />}
              type="primary"
              onClick={() => onEdit(record)}
            />
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => onDelete(record._id)}
            />
          </Space>
        ),
      },
    ],
    [onView, onEdit, onDelete]
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default PurchaseTable;

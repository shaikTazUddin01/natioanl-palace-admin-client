"use client";
import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TSaleRow } from "@/src/types/sales";
import { openInvoice } from "@/src/utils/sales.utils";

type Props = {
  data: TSaleRow[];
  loading: boolean;
  onView: (sale: TSaleRow) => void;
  onDelete: (id?: string) => void;
};

export default function SalesTable({ data, loading, onView, onDelete }: Props) {
  const columns: ColumnsType<TSaleRow> = [
    { title: "Date", dataIndex: "date" },
    { title: "Invoice", dataIndex: "invoiceNo", render: (v) => <strong>{v}</strong> },
    { title: "Customer", dataIndex: "customerName" },
    { title: "Product", dataIndex: "productName" },
    { title: "Qty", dataIndex: "quantity", align: "center" },
    { title: "Total", dataIndex: "totalAmount", render: (v) => `৳ ${Number(v).toLocaleString()}` },
    { title: "Paid", dataIndex: "paidAmount", render: (v) => `৳ ${Number(v).toLocaleString()}` },
    { title: "Due", dataIndex: "dueAmount", render: (v) => <span className={Number(v) > 0 ? "text-red-500 font-semibold" : ""}>৳ {Number(v).toLocaleString()}</span> },
    { title: "Method", dataIndex: "paymentMethod", render: (m) => (m ? <Tag color="blue">{m}</Tag> : <Tag color="red">DUE</Tag>) },
    { title: "Status", dataIndex: "status", render: (s) =>
      s === "PAID" ? <Tag color="green">PAID</Tag> :
      s === "PARTIAL" ? <Tag color="gold">PARTIAL</Tag> :
      <Tag color="volcano">DUE</Tag>
    },
    { title: "Action", fixed: "right", render: (_, record) => (
      <Space>
        <Button size="small" type="primary" onClick={() => onView(record)}>View</Button>
        <Button size="small" onClick={() => openInvoice(record)}>Invoice</Button>
        <Button size="small" danger onClick={() => onDelete(record._id)}>Delete</Button>
      </Space>
    )}
  ];

  return <Table columns={columns} dataSource={data} scroll={{ x: 1200 }} loading={loading} pagination={{ pageSize: 8 }} />;
}

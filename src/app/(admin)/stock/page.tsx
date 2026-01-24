"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

/* ---------------- Demo Stock Data ---------------- */
type StockRow = {
  key: string;
  productName: string;
  sku: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

const stockData: StockRow[] = [
  {
    key: "1",
    productName: "Samsung A14",
    sku: "ELEC-SAMSUNG-A14",
    category: "Electronics",
    purchasePrice: 12000,
    salePrice: 14500,
    stockIn: 40,
    stockOut: 15,
    currentStock: 25,
    status: "In Stock",
  },
  {
    key: "2",
    productName: "Rice 25kg",
    sku: "GROC-RICE-25KG",
    category: "Grocery",
    purchasePrice: 1800,
    salePrice: 2100,
    stockIn: 10,
    stockOut: 7,
    currentStock: 3,
    status: "Low Stock",
  },
  {
    key: "3",
    productName: "Notebook A4",
    sku: "STAT-NOTEBOOK-A4",
    category: "Stationary",
    purchasePrice: 60,
    salePrice: 80,
    stockIn: 50,
    stockOut: 50,
    currentStock: 0,
    status: "Out of Stock",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<StockRow> = [
  {
    title: "Product Name",
    dataIndex: "productName",
    key: "productName",
    fixed: "left",
  },
  {
    title: "SKU",
    dataIndex: "sku",
    key: "sku",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Purchase Price",
    dataIndex: "purchasePrice",
    key: "purchasePrice",
    render: (price) => `৳ ${price}`,
  },
  {
    title: "Sale Price",
    dataIndex: "salePrice",
    key: "salePrice",
    render: (price) => `৳ ${price}`,
  },
  {
    title: "Stock In",
    dataIndex: "stockIn",
    key: "stockIn",
    render: (v) => <Tag color="green">{v}</Tag>,
  },
  {
    title: "Stock Out",
    dataIndex: "stockOut",
    key: "stockOut",
    render: (v) => <Tag color="volcano">{v}</Tag>,
  },
  {
    title: "Current Stock",
    dataIndex: "currentStock",
    key: "currentStock",
    render: (stock) => (
      <Tag color={stock === 0 ? "red" : stock <= 5 ? "gold" : "blue"}>
        {stock}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status, record) => {
      const color =
        record.currentStock === 0
          ? "red"
          : record.currentStock <= 5
          ? "gold"
          : "green";

      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    render: () => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} />
        <Button size="small" icon={<EditOutlined />} type="primary" />
        <Button size="small" icon={<DeleteOutlined />} danger />
      </Space>
    ),
  },
];

const Page = () => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Current Stock
          </h1>
          <p className="text-slate-500">
            Monitor available stock and movement summary
          </p>
        </div>

        <Button type="primary">Stock Adjustment</Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={stockData}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;

"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

/* ---------------- Demo Product Data ---------------- */
const productData = [
  {
    key: "1",
    name: "Samsung A14",
    sku: "ELEC-SAMSUNG-A14",
    category: "Electronics",
    purchasePrice: 12000,
    salePrice: 14500,
    stock: 25,
    status: "In Stock",
  },
  {
    key: "2",
    name: "Rice 25kg",
    sku: "GROC-RICE-25KG",
    category: "Grocery",
    purchasePrice: 1800,
    salePrice: 2100,
    stock: 3,
    status: "Low Stock",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<any> = [
  {
    title: "Product Name",
    dataIndex: "name",
    key: "name",
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
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
    render: (stock) => (
      <Tag color={stock <= 5 ? "red" : "green"}>
        {stock}
      </Tag>
    ),
  },
  {
    title: "Status",
    key: "status",
    render: (_, record) => (
      <Tag color={record.stock <= 5 ? "volcano" : "blue"}>
        {record.stock <= 5 ? "Low Stock" : "In Stock"}
      </Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    render: () => (
      <Space>
        <Button
          size="small"
          icon={<EditOutlined />}
          type="primary"
        />
        <Button
          size="small"
          icon={<DeleteOutlined />}
          danger
        />
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
            Manage Products
          </h1>
          <p className="text-slate-500">
            View, edit and manage your products
          </p>
        </div>

        <Button type="primary">
          Add Product
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={productData}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;

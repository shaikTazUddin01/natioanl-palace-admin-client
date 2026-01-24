"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

/* ---------------- Demo Category Data ---------------- */
const categoryData = [
  {
    key: "1",
    name: "Electronics",
    code: "ELEC",
    description: "Phones, gadgets and accessories",
    totalProducts: 12,
    status: "Active",
  },
  {
    key: "2",
    name: "Grocery",
    code: "GROC",
    description: "Daily essentials and food items",
    totalProducts: 28,
    status: "Active",
  },
  {
    key: "3",
    name: "Stationary",
    code: "STAT",
    description: "Office & school supplies",
    totalProducts: 6,
    status: "Inactive",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<any> = [
  {
    title: "Category Name",
    dataIndex: "name",
    key: "name",
    fixed: "left",
  },
  {
    title: "Code",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
  },
  {
    title: "Total Products",
    dataIndex: "totalProducts",
    key: "totalProducts",
    render: (count) => <Tag>{count}</Tag>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    render: () => (
      <Space>
        <Button size="small" icon={<EditOutlined />} type="primary" />
        <Button size="small" icon={<DeleteOutlined />} danger />
      </Space>
    ),
  },
];

const Page = () => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Categories</h1>
          <p className="text-slate-500">
            View, edit and manage your categories
          </p>
        </div>

        <Button type="primary" onClick={() => router.push("/categories/create")}>
          Add Category
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={categoryData}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;

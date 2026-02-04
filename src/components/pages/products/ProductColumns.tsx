"use client";

import React from "react";
import { Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { TProductRow } from "@/src/app/(admin)/products/page";

type Args = {
  onEdit: (row: TProductRow) => void;
  onDelete: (id?: string) => void;
};

export const getProductColumns = ({ onEdit, onDelete }: Args): ColumnsType<TProductRow> => [
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
    render: (stock) => <Tag color={stock <= 5 ? "red" : "green"}>{stock}</Tag>,
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
    render: (_, record) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => onEdit(record)} />
        <Button size="small" icon={<DeleteOutlined />} danger onClick={() => onDelete(record._id)} />
      </Space>
    ),
  },
];

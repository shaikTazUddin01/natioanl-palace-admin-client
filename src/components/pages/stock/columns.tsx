import React from "react";
import { Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { StockStatus, TStockRow } from "@/src/types";
import { statusColor } from "@/src/utils/stock.utils";


export const createStockColumns = (
  onView: (row: TStockRow) => void,
  onAdjust: (row: TStockRow) => void
): ColumnsType<TStockRow> => [
  {
    title: "Product Name",
    dataIndex: "productName",
    key: "productName",
    fixed: "left",
  },
  { title: "SKU", dataIndex: "sku", key: "sku" },
  { title: "Category", dataIndex: "category", key: "category" },
  {
    title: "Purchase Price",
    dataIndex: "purchasePrice",
    key: "purchasePrice",
    render: (v) => `৳ ${Number(v).toLocaleString()}`,
  },
  {
    title: "Sale Price",
    dataIndex: "salePrice",
    key: "salePrice",
    render: (v) => `৳ ${Number(v).toLocaleString()}`,
  },
  {
    title: "Stock In",
    dataIndex: "stockIn",
    key: "stockIn",
    render: (v) => <Tag color="green">{Number(v)}</Tag>,
  },
  {
    title: "Stock Out",
    dataIndex: "stockOut",
    key: "stockOut",
    render: (v) => <Tag color="volcano">{Number(v)}</Tag>,
  },
  {
    title: "Current Stock",
    dataIndex: "currentStock",
    key: "currentStock",
    render: (qty) => <Tag color={statusColor(Number(qty))}>{Number(qty)}</Tag>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (_: StockStatus, record) => (
      <Tag color={statusColor(record.currentStock)}>{record.status}</Tag>
    ),
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
          onClick={() => onAdjust(record)}
        />
      </Space>
    ),
  },
];

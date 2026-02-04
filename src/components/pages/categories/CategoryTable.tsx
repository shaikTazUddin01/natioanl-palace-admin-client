"use client";

import { useMemo } from "react";
import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { TCategoryRow } from "@/src/types";


type Props = {
  data: TCategoryRow[];
  loading?: boolean;
  onEdit: (row: TCategoryRow) => void;
  onDelete: (id?: string) => void;
};

const CategoryTable = ({ data, loading, onEdit, onDelete }: Props) => {
  const columns: ColumnsType<TCategoryRow> = useMemo(
    () => [
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
        render: (text) => text || "-",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: "active" | "inactive") => (
          <Tag color={status === "active" ? "green" : "red"}>
            {status === "active" ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        title: "Action",
        key: "action",
        fixed: "right",
        render: (_, record) => (
          <Space>
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
    [onEdit, onDelete]
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1000 }}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default CategoryTable;

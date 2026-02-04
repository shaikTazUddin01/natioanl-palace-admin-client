"use client";

import React, { useMemo } from "react";
import { Table } from "antd";
import { TProductRow } from "@/src/app/(admin)/products/page";
import { getProductColumns } from "./ProductColumns";


type Props = {
  data: TProductRow[];
  loading: boolean;
  onEdit: (row: TProductRow) => void;
  onDelete: (id?: string) => void;
};

const ProductTable: React.FC<Props> = ({ data, loading, onEdit, onDelete }) => {
  const columns = useMemo(() => getProductColumns({ onEdit, onDelete }), [onEdit, onDelete]);

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

export default ProductTable;

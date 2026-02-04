"use client";

import React from "react";
import { Button } from "antd";
import Link from "next/link";

const ManageHeader = () => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Products</h1>
        <p className="text-slate-500">View, edit and manage your products</p>
      </div>

      <Link href="/products/create">
        <Button type="primary">Add Product</Button>
      </Link>
    </div>
  );
};

export default ManageHeader;

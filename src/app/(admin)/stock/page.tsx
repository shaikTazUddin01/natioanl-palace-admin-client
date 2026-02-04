"use client";

import { useMemo, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Input,
  Select,
  Statistic,
  Card,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { useGetProductsQuery, useUpdateProductMutation } from "@/src/redux/features/product/productApi";
import { useGetPurchasesQuery } from "@/src/redux/features/purchase/purchaseApi";
import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

type TStockRow = {
  key: string;
  _id?: string;

  productName: string;
  sku: string;
  category: string;

  purchasePrice: number;
  salePrice: number;

  stockIn: number;
  stockOut: number;
  currentStock: number;

  status: StockStatus;

  // optional raw fields
  note?: string;
};

const lowStockLimit = 5;

const statusFromQty = (qty: number): StockStatus => {
  if (qty <= 0) return "Out of Stock";
  if (qty <= lowStockLimit) return "Low Stock";
  return "In Stock";
};

const statusColor = (qty: number) => {
  if (qty <= 0) return "red";
  if (qty <= lowStockLimit) return "gold";
  return "green";
};

const Page = () => {
  // -------- API ----------
  const { data: pData, isLoading: pLoading, isFetching: pFetching, isError: pError } =
    useGetProductsQuery(undefined);

  const { data: purData, isLoading: purLoading, isFetching: purFetching } =
    useGetPurchasesQuery(undefined);

  const { data: sData, isLoading: sLoading, isFetching: sFetching } =
    useGetSalesQuery(undefined);

  const [updateProduct] = useUpdateProductMutation();

  const productsRaw = pData?.data ?? pData ?? [];
  const purchasesRaw = purData?.data ?? purData ?? [];
  const salesRaw = sData?.data ?? sData ?? [];

  // -------- UI states ----------
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<StockStatus | undefined>();

  const [viewOpen, setViewOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selected, setSelected] = useState<TStockRow | null>(null);

  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustQty, setAdjustQty] = useState<number>(0);

  // -------- Helpers ----------
  const safeNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // -------- Build Stock Summary (from products + purchases + sales) ----------
  const stockRows: TStockRow[] = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];

    // build maps for stock in/out by productName or productId (depends on your backend)
    const purchaseInMap = new Map<string, number>();
    if (Array.isArray(purchasesRaw)) {
      purchasesRaw.forEach((p: any) => {
        const key = String(p?.productId || p?.product?._id || p?.productName || "");
        if (!key) return;
        const qty = safeNum(p?.quantity);
        purchaseInMap.set(key, (purchaseInMap.get(key) || 0) + qty);
      });
    }

    const salesOutMap = new Map<string, number>();
    if (Array.isArray(salesRaw)) {
      salesRaw.forEach((s: any) => {
        const key = String(s?.productId || s?.product?._id || s?.productName || "");
        if (!key) return;
        const qty = safeNum(s?.quantity);
        salesOutMap.set(key, (salesOutMap.get(key) || 0) + qty);
      });
    }

    // build rows
    return productsRaw.map((prod: any) => {
      const id = String(prod?._id || prod?.id || "");
      const name = String(prod?.name ?? prod?.productName ?? "-");
      const sku = String(prod?.sku ?? "-");
      const category = String(prod?.category?.name ?? prod?.category ?? "-");

      const purchasePrice = safeNum(prod?.purchasePrice);
      const salePrice = safeNum(prod?.salePrice);

      // ✅ try match by id first, then by name (fallback)
      const stockIn = safeNum(purchaseInMap.get(id) ?? purchaseInMap.get(name) ?? 0);
      const stockOut = safeNum(salesOutMap.get(id) ?? salesOutMap.get(name) ?? 0);

      // ✅ if backend already has quantity/currentStock keep it as base
      const baseQty = safeNum(prod?.quantity ?? prod?.currentStock ?? 0);

      // best logic:
      // - If your system uses purchase/sale to calculate, then current = stockIn - stockOut
      // - If you keep product.quantity as truth, set current = baseQty and show movements separately
      // এখানে আমি movement-based হিসাব দিচ্ছি, কিন্তু baseQty থাকলে prefer করবে:
      const movementQty = Math.max(stockIn - stockOut, 0);
      const currentStock = baseQty > 0 ? baseQty : movementQty;

      return {
        key: id || sku || name,
        _id: id || undefined,
        productName: name,
        sku,
        category,
        purchasePrice,
        salePrice,
        stockIn,
        stockOut,
        currentStock,
        status: statusFromQty(currentStock),
      };
    });
  }, [productsRaw, purchasesRaw, salesRaw]);

  // -------- Category options ----------
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    stockRows.forEach((r) => r.category && set.add(r.category));
    return Array.from(set).sort().map((c) => ({ label: c, value: c }));
  }, [stockRows]);

  // -------- Filters ----------
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return stockRows.filter((r) => {
      const matchSearch =
        !q ||
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);

      const matchCategory = !categoryFilter || r.category === categoryFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [stockRows, search, categoryFilter, statusFilter]);

  // -------- Summary Cards ----------
  const summary = useMemo(() => {
    const totalItems = stockRows.length;
    const low = stockRows.filter((r) => r.currentStock > 0 && r.currentStock <= lowStockLimit).length;
    const out = stockRows.filter((r) => r.currentStock <= 0).length;

    const totalPurchaseValue = stockRows.reduce(
      (acc, r) => acc + r.currentStock * safeNum(r.purchasePrice),
      0
    );
    const totalSaleValue = stockRows.reduce(
      (acc, r) => acc + r.currentStock * safeNum(r.salePrice),
      0
    );

    return { totalItems, low, out, totalPurchaseValue, totalSaleValue };
  }, [stockRows]);

  // -------- Actions ----------
  const openView = (row: TStockRow) => {
    setSelected(row);
    setViewOpen(true);
  };

  const openAdjust = (row?: TStockRow) => {
    if (row) setSelected(row);
    setAdjustType("IN");
    setAdjustQty(row ? row.currentStock : 0);
    setAdjustOpen(true);
  };

  const handleAdjustSave = async () => {
    if (!selected?._id) {
      toast.error("Product id not found");
      return;
    }

    const qty = Number(adjustQty);
    if (!qty || qty < 0) {
      toast.error("Quantity must be 0 or greater");
      return;
    }

    // ✅ ensure OUT doesn’t go negative
    let newStock = qty;
    if (adjustType === "OUT") {
      // interpret as: reduce by qty
      if (qty > selected.currentStock) {
        toast.error("Stock out cannot exceed current stock");
        return;
      }
      newStock = selected.currentStock - qty;
    } else {
      // IN: add qty
      newStock = selected.currentStock + qty;
    }

    const confirm = await Swal.fire({
      title: "Confirm Stock Adjustment?",
      text:
        adjustType === "IN"
          ? `Add ${qty} to ${selected.productName}`
          : `Remove ${qty} from ${selected.productName}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const toastId = toast.loading("Updating stock...");

    try {
      // ✅ backend must support updateProduct({id, quantity: newStock})
      const res = await updateProduct({
        id: selected._id,
        quantity: newStock,
      }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Stock updated successfully", { id: toastId });
        setAdjustOpen(false);
        setSelected(null);
      } else {
        toast.error(res?.message || "Failed to update stock", { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to update stock", { id: toastId });
    }
  };

  // -------- Table Columns ----------
  const columns: ColumnsType<TStockRow> = [
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
      render: (qty) => (
        <Tag color={statusColor(Number(qty))}>{Number(qty)}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Tag color={statusColor(record.currentStock)}>{record.status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openView(record)} />
          <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => openAdjust(record)} />
        </Space>
      ),
    },
  ];

  const loading = pLoading || pFetching || purLoading || purFetching || sLoading || sFetching;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Current Stock</h1>
          <p className="text-slate-500">Monitor stock, movement and inventory value</p>
        </div>

        <Button type="primary" onClick={() => openAdjust()}>
          Stock Adjustment
        </Button>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Total Products" value={summary.totalItems} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Low Stock" value={summary.low} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Out of Stock" value={summary.out} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Stock Value (Purchase)"
              value={summary.totalPurchaseValue}
              formatter={(v) => `৳ ${Number(v).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search product / SKU / category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          allowClear
          placeholder="Category"
          className="w-full"
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v)}
          options={categoryOptions}
        />

        <Select
          allowClear
          placeholder="Stock Status"
          className="w-full"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          options={[
            { label: "In Stock", value: "In Stock" },
            { label: "Low Stock", value: "Low Stock" },
            { label: "Out of Stock", value: "Out of Stock" },
          ]}
        />

        <Button
          danger
          onClick={() => {
            setSearch("");
            setCategoryFilter(undefined);
            setStatusFilter(undefined);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      {pError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load stock data. Please try again.
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredRows}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* View Modal */}
      <Modal
        title="Stock Details"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        destroyOnHidden
      >
        {selected ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Product</span>
              <span className="font-medium">{selected.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SKU</span>
              <span className="font-medium">{selected.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-medium">{selected.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stock In</span>
              <span className="font-medium">{selected.stockIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stock Out</span>
              <span className="font-medium">{selected.stockOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Stock</span>
              <span className="font-medium text-blue-700">{selected.currentStock}</span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        title="Stock Adjustment"
        open={adjustOpen}
        onCancel={() => setAdjustOpen(false)}
        onOk={handleAdjustSave}
        okText="Save"
        destroyOnHidden
      >
        {selected ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <div>
                <strong>{selected.productName}</strong> • <strong>{selected.sku}</strong>
              </div>
              <div>
                Current Stock:{" "}
                <strong className="text-blue-700">
                  {selected.currentStock}
                </strong>
              </div>
            </div>

            <Select
              className="w-full"
              value={adjustType}
              onChange={(v) => setAdjustType(v)}
              options={[
                { label: "Stock In (Add)", value: "IN" },
                { label: "Stock Out (Remove)", value: "OUT" },
              ]}
            />

            <Input
              type="number"
              min={0}
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              placeholder={adjustType === "IN" ? "Add Quantity" : "Remove Quantity"}
            />

            {adjustType === "OUT" && adjustQty > selected.currentStock ? (
              <div className="text-red-600 text-sm">
                Stock out cannot exceed current stock.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-slate-500">
            Select a product from table to adjust stock.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Page;

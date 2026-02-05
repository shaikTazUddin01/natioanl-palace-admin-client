"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { useGetProductsQuery, useUpdateProductMutation } from "@/src/redux/features/product/productApi";
import { useGetPurchasesQuery } from "@/src/redux/features/purchase/purchaseApi";
import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";
import { StockStatus, TStockRow } from "@/src/types";
import { lowStockLimit, safeNum, statusFromQty } from "@/src/utils/stock.utils";
import { createStockColumns } from "@/src/components/pages/stock/columns";
import StockHeader from "@/src/components/pages/stock/StockHeader";
import StockFilters from "@/src/components/pages/stock/StockFilters";
import StockSummary from "@/src/components/pages/stock/StockSummary";
import StockTable from "@/src/components/pages/stock/StockTable";
import StockViewModal from "@/src/components/pages/stock/StockViewModal";
import StockAdjustModal from "@/src/components/pages/stock/StockAdjustModal";


export default function StockPageClient() {
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

  // -------- Build Stock Summary (from products + purchases + sales) ----------
  const stockRows: TStockRow[] = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];

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

    return productsRaw.map((prod: any) => {
      const id = String(prod?._id || prod?.id || "");
      const name = String(prod?.name ?? prod?.productName ?? "-");
      const sku = String(prod?.sku ?? "-");
      const category = String(prod?.category?.name ?? prod?.category ?? "-");

      const purchasePrice = safeNum(prod?.purchasePrice);
      const salePrice = safeNum(prod?.salePrice);

      const stockIn = safeNum(purchaseInMap.get(id) ?? purchaseInMap.get(name) ?? 0);
      const stockOut = safeNum(salesOutMap.get(id) ?? salesOutMap.get(name) ?? 0);

      const baseQty = safeNum(prod?.quantity ?? prod?.currentStock ?? 0);

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
    return Array.from(set)
      .sort()
      .map((c) => ({ label: c, value: c }));
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

    let newStock = qty;

    if (adjustType === "OUT") {
      if (qty > selected.currentStock) {
        toast.error("Stock out cannot exceed current stock");
        return;
      }
      newStock = selected.currentStock - qty;
    } else {
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

  const columns = useMemo(() => createStockColumns(openView, (r) => openAdjust(r)), []);

  const loading = pLoading || pFetching || purLoading || purFetching || sLoading || sFetching;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <StockHeader onOpenAdjust={() => openAdjust()} />

      <StockSummary
        totalItems={summary.totalItems}
        low={summary.low}
        out={summary.out}
        totalPurchaseValue={summary.totalPurchaseValue}
      />

      <StockFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryOptions={categoryOptions}
        onReset={() => {
          setSearch("");
          setCategoryFilter(undefined);
          setStatusFilter(undefined);
        }}
      />

      <StockTable
        columns={columns}
        data={filteredRows}
        loading={loading}
        isError={!!pError}
      />

      <StockViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        selected={selected}
      />

      <StockAdjustModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        onOk={handleAdjustSave}
        selected={selected}
        adjustType={adjustType}
        setAdjustType={setAdjustType}
        adjustQty={adjustQty}
        setAdjustQty={setAdjustQty}
      />
    </div>
  );
}

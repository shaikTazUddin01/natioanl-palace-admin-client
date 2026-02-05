"use client";

import { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";
import { useGetProductsQuery } from "@/src/redux/features/product/productApi";
import { normalize } from "path";
import { MonthlyProfitRow, ProfitSummary } from "@/src/types";
import ProfitHeader from "@/src/components/pages/totalProfit/Header";
import ProfitSummaryCards from "@/src/components/pages/totalProfit/SummeryCard";
import ProfitFilters from "@/src/components/pages/totalProfit/ProfitFilter";
import ProfitTable from "@/src/components/pages/totalProfit/ProfitTable";


export default function MonthlyProfitPage() {
  // ✅ APIs
  const {
    data: salesRes,
    isLoading: salesLoading,
    isFetching: salesFetching,
    isError: salesError,
  } = useGetSalesQuery(undefined);

  const {
    data: productsRes,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError: productsError,
  } = useGetProductsQuery(undefined);

  const rawSales = salesRes?.data ?? salesRes ?? [];
  const rawProducts = productsRes?.data ?? productsRes ?? [];

  // ✅ UI Filters
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // ✅ Product map by name (case-insensitive)
  const productByName = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(rawProducts)) {
      rawProducts.forEach((p: any) => {
        const key = normalize(p?.name ?? p?.productName);
        if (!key) return;
        map.set(key, p);
      });
    }
    return map;
  }, [rawProducts]);

  // ✅ Product options for filter
  const productOptions = useMemo(() => {
    if (!Array.isArray(rawProducts)) return [];
    return rawProducts
      .map((p: any) => {
        const name = String(p?.name ?? p?.productName ?? "-");
        const sku = String(p?.sku ?? "");
        return { label: sku ? `${name} (${sku})` : name, value: normalize(name) };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawProducts]);

  // ✅ Filter sales (search + product + date)
  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!Array.isArray(rawSales)) return [];

    return rawSales.filter((s: any) => {
      const saleProductName = String(s?.productName ?? "-");
      const saleKey = normalize(saleProductName);

      const matchSearch =
        !q ||
        saleProductName.toLowerCase().includes(q) ||
        String(s?.customerName ?? "").toLowerCase().includes(q) ||
        String(s?.invoiceNo ?? "").toLowerCase().includes(q);

      const matchProduct = !productFilter || saleKey === productFilter;

      const saleDate = s?.date || s?.createdAt;
      const d = saleDate ? dayjs(saleDate) : null;

      const matchDate =
        !dateRange ||
        (d &&
          d.isSameOrAfter(dateRange[0], "day") &&
          d.isSameOrBefore(dateRange[1], "day"));

      return matchSearch && matchProduct && matchDate;
    });
  }, [rawSales, search, productFilter, dateRange]);

  // ✅ Month-wise aggregation
  const monthlyRows: MonthlyProfitRow[] = useMemo(() => {
    const byMonth = new Map<string, MonthlyProfitRow>();

    filteredSales.forEach((s: any) => {
      const qty = Number(s?.quantity ?? 0);
      const unitPrice = Number(s?.unitPrice ?? 0);

      const saleDate = s?.date || s?.createdAt;
      const month = saleDate ? dayjs(saleDate).format("YYYY-MM") : "Unknown";

      const prodKey = normalize(s?.productName);
      const prod = productByName.get(prodKey);

      const purchasePrice = Number(prod?.purchasePrice ?? 0);

      const revenue = unitPrice * qty;
      const cogs = purchasePrice * qty;
      const profit = revenue - cogs;

      const current = byMonth.get(month) || {
        key: month,
        month,
        totalSoldQty: 0,
        revenue: 0,
        cogs: 0,
        profit: 0,
      };

      current.totalSoldQty += qty;
      current.revenue += revenue;
      current.cogs += cogs;
      current.profit += profit;

      byMonth.set(month, current);
    });

    return Array.from(byMonth.values()).sort((a, b) =>
      a.month < b.month ? 1 : -1
    );
  }, [filteredSales, productByName]);

  // ✅ Summary
  const summary: ProfitSummary = useMemo(() => {
    const totalProfit = monthlyRows.reduce((acc, r) => acc + r.profit, 0);
    const totalSoldQty = monthlyRows.reduce((acc, r) => acc + r.totalSoldQty, 0);
    const totalRevenue = monthlyRows.reduce((acc, r) => acc + r.revenue, 0);
    const totalCogs = monthlyRows.reduce((acc, r) => acc + r.cogs, 0);

    const bestMonth = monthlyRows.reduce<MonthlyProfitRow | null>((best, r) => {
      if (!best) return r;
      return r.profit > best.profit ? r : best;
    }, null);

    return {
      totalProfit,
      totalSoldQty,
      totalRevenue,
      totalCogs,
      bestMonth: bestMonth?.month || "-",
      bestMonthProfit: bestMonth?.profit || 0,
    };
  }, [monthlyRows]);

  const loading = salesLoading || salesFetching || productsLoading || productsFetching;
  const isError = salesError || productsError;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <ProfitHeader />

      <ProfitSummaryCards summary={summary} />

      <ProfitFilters
        search={search}
        setSearch={setSearch}
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        productOptions={productOptions}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onReset={() => {
          setSearch("");
          setProductFilter(undefined);
          setDateRange(null);
        }}
      />

      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load profit data. Please try again.
        </div>
      ) : (
        <ProfitTable data={monthlyRows} loading={loading} />
      )}
    </div>
  );
}
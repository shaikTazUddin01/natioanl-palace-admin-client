"use client";

import React, { useMemo, useState } from "react";
import { Row, Col, Card, Table, Space, Badge, Tag, Select, DatePicker, Input, Empty, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  WalletOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

// ✅ তোমার RTK hooks (import path adjust করো যদি ভিন্ন হয়)
import { useGetProductsQuery } from "@/src/redux/features/product/productApi";
import { useGetPurchasesQuery } from "@/src/redux/features/purchase/purchaseApi";
import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";

const { RangePicker } = DatePicker;
const { Option } = Select;

type PaymentMethod = "CASH" | "BANK" | "BKASH" | "NAGAD" | null | undefined;

const safeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const toDateStr = (d?: any) => {
  if (!d) return "";
  return dayjs(d).format("YYYY-MM-DD");
};

const getLastNDays = (n = 7) => {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
};

const DashboardPage: React.FC = () => {
  // optional filters for dashboard
  const [dateRange, setDateRange] = useState<any>(null);
  const [search, setSearch] = useState("");

  // ✅ Fetch all data
  const {
    data: productsRes,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
  } = useGetProductsQuery(undefined);

  const {
    data: purchasesRes,
    isLoading: purchaseLoading,
    isFetching: purchaseFetching,
    isError: purchaseError,
  } = useGetPurchasesQuery(undefined);

  const {
    data: salesRes,
    isLoading: salesLoading,
    isFetching: salesFetching,
    isError: salesError,
  } = useGetSalesQuery(undefined);

  const loading = productLoading || productFetching || purchaseLoading || purchaseFetching || salesLoading || salesFetching;
  const isError = productError || purchaseError || salesError;

  const rawProducts = productsRes?.data ?? productsRes ?? [];
  const rawPurchases = purchasesRes?.data ?? purchasesRes ?? [];
  const rawSales = salesRes?.data ?? salesRes ?? [];

  // ✅ Apply dateRange filter function for records
  const inRange = (d: string) => {
    if (!dateRange) return true;
    const start = dayjs(dateRange?.[0]);
    const end = dayjs(dateRange?.[1]);
    const x = dayjs(d);
    return x.isAfter(start.subtract(1, "day")) && x.isBefore(end.add(1, "day"));
  };

  // ✅ Normalize + compute core numbers
  const computed = useMemo(() => {
    // Products
    const products = Array.isArray(rawProducts) ? rawProducts : [];
    const totalProducts = products.length;

    // Stock
    const totalStockQty = products.reduce((sum: number, p: any) => sum + Number(p?.quantity ?? p?.stock ?? 0), 0);

    const lowStockList = products
      .map((p: any) => ({
        _id: p?._id || p?.id || safeId(),
        name: p?.name ?? p?.productName ?? "-",
        sku: p?.sku ?? "-",
        qty: Number(p?.quantity ?? p?.stock ?? 0),
      }))
      .filter((x) => x.qty > 0 && x.qty <= 5)
      .slice(0, 8);

    const outOfStockList = products
      .map((p: any) => ({
        _id: p?._id || p?.id || safeId(),
        name: p?.name ?? p?.productName ?? "-",
        sku: p?.sku ?? "-",
        qty: Number(p?.quantity ?? p?.stock ?? 0),
      }))
      .filter((x) => x.qty === 0)
      .slice(0, 8);

    // Purchases
    const purchases = Array.isArray(rawPurchases) ? rawPurchases : [];
    const filteredPurchases = purchases.filter((p: any) => {
      const d = toDateStr(p?.date || p?.createdAt);
      return d ? inRange(d) : true;
    });

    const totalPurchaseInvoices = filteredPurchases.length;

    let purchasePaidTotal = 0;
    let purchaseDueTotal = 0;
    let bankPurchasePaid = 0;
    filteredPurchases.forEach((p: any) => {
      const total = Number(p?.totalAmount ?? 0);
      const paid = Number(p?.paidAmount ?? 0);
      const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));
      purchasePaidTotal += paid;
      purchaseDueTotal += due;

      const method = (p?.paymentMethod ?? null) as PaymentMethod;
      if (method === "BANK") bankPurchasePaid += paid;
    });

    // Sales
    const sales = Array.isArray(rawSales) ? rawSales : [];
    const filteredSales = sales.filter((s: any) => {
      const d = toDateStr(s?.date || s?.createdAt);
      return d ? inRange(d) : true;
    });

    const totalSalesInvoices = filteredSales.length;

    let salesPaidTotal = 0;
    let salesDueTotal = 0;
    let bankSalesPaid = 0;
    filteredSales.forEach((s: any) => {
      const total = Number(s?.totalAmount ?? 0);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));
      salesPaidTotal += paid;
      salesDueTotal += due;

      const method = (s?.paymentMethod ?? null) as PaymentMethod;
      if (method === "BANK") bankSalesPaid += paid;
    });

    // ✅ Cash/Bank balances
    // cash in hand = salesPaid - purchasePaid
    const cashBalance = salesPaidTotal - purchasePaidTotal;

    // bank balance = bankSalesPaid - bankPurchasePaid
    const bankBalance = bankSalesPaid - bankPurchasePaid;

    // ✅ Customer Due summary (Top)
    const customerDueMap = new Map<string, number>();
    filteredSales.forEach((s: any) => {
      const name = (s?.customerName ?? "Walk-in Customer") as string;
      const total = Number(s?.totalAmount ?? 0);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));
      if (due > 0) customerDueMap.set(name, (customerDueMap.get(name) ?? 0) + due);
    });

    const topCustomerDue = Array.from(customerDueMap.entries())
      .map(([customer, amount]) => ({ key: customer, customer, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // ✅ Supplier Due summary (Top)
    const supplierDueMap = new Map<string, number>();
    filteredPurchases.forEach((p: any) => {
      const name = (p?.supplierName ?? "-") as string;
      const total = Number(p?.totalAmount ?? 0);
      const paid = Number(p?.paidAmount ?? 0);
      const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));
      if (due > 0) supplierDueMap.set(name, (supplierDueMap.get(name) ?? 0) + due);
    });

    const topSupplierDue = Array.from(supplierDueMap.entries())
      .map(([supplier, amount]) => ({ key: supplier, supplier, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // ✅ Recent Sales table
    const recentSales = filteredSales
      .map((s: any) => ({
        key: s?._id || s?.id || safeId(),
        date: toDateStr(s?.date || s?.createdAt) || "-",
        invoiceNo: s?.invoiceNo ?? "-",
        customerName: s?.customerName ?? "Walk-in Customer",
        productName: s?.productName ?? "-",
        quantity: Number(s?.quantity ?? 0),
        totalAmount: Number(s?.totalAmount ?? 0),
        paidAmount: Number(s?.paidAmount ?? 0),
        dueAmount: Number(s?.dueAmount ?? Math.max(Number(s?.totalAmount ?? 0) - Number(s?.paidAmount ?? 0), 0)),
        paymentMethod: (s?.paymentMethod ?? null) as PaymentMethod,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 8);

    // ✅ Charts (last 7 days) based on FULL raw data (not filtered by dateRange)
    const days = getLastNDays(7);
    const chart = days.map((d) => {
      let salesTotal = 0;
      let purchaseTotal = 0;

      if (Array.isArray(sales)) {
        sales.forEach((s: any) => {
          const dd = toDateStr(s?.date || s?.createdAt);
          if (dd === d) salesTotal += Number(s?.totalAmount ?? 0);
        });
      }

      if (Array.isArray(purchases)) {
        purchases.forEach((p: any) => {
          const dd = toDateStr(p?.date || p?.createdAt);
          if (dd === d) purchaseTotal += Number(p?.totalAmount ?? 0);
        });
      }

      return {
        day: dayjs(d).format("ddd"),
        date: d,
        sales: salesTotal,
        purchase: purchaseTotal,
        net: salesTotal - purchaseTotal,
      };
    });

    return {
      totalProducts,
      totalStockQty,
      totalPurchaseInvoices,
      totalSalesInvoices,
      salesPaidTotal,
      salesDueTotal,
      purchasePaidTotal,
      purchaseDueTotal,
      cashBalance,
      bankBalance,
      lowStockList,
      outOfStockList,
      topCustomerDue,
      topSupplierDue,
      recentSales,
      chart,
    };
  }, [rawProducts, rawPurchases, rawSales, dateRange]);

  // ✅ Search filter across dashboard lists (optional)
  const searchQ = search.trim().toLowerCase();
  const lowStockFiltered = useMemo(() => {
    if (!searchQ) return computed.lowStockList;
    return computed.lowStockList.filter((x) => x.name.toLowerCase().includes(searchQ) || x.sku.toLowerCase().includes(searchQ));
  }, [computed.lowStockList, searchQ]);

  const outOfStockFiltered = useMemo(() => {
    if (!searchQ) return computed.outOfStockList;
    return computed.outOfStockList.filter((x) => x.name.toLowerCase().includes(searchQ) || x.sku.toLowerCase().includes(searchQ));
  }, [computed.outOfStockList, searchQ]);

  const recentSalesColumns: ColumnsType<any> = [
    { title: "Date", dataIndex: "date", key: "date", width: 110 },
    {
      title: "Invoice",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (v) => <strong>{v}</strong>,
    },
    { title: "Customer", dataIndex: "customerName", key: "customerName" },
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Qty", dataIndex: "quantity", key: "quantity", align: "center", width: 70 },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      key: "dueAmount",
      render: (v) => (
        <Tag color={Number(v) > 0 ? "volcano" : "green"}>৳ {Number(v).toLocaleString()}</Tag>
      ),
    },
  ];

  const dueColumns: ColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "customer",
      key: "customer",
      render: (v, r) => <span className="font-medium">{v ?? r.supplier}</span>,
    },
    {
      title: "Due",
      dataIndex: "amount",
      key: "amount",
      render: (v) => <Tag color="volcano">৳ {Number(v).toLocaleString()}</Tag>,
      width: 140,
    },
  ];

  // ✅ Metric cards config
  const stats = [
    {
      title: "Total Products",
      value: computed.totalProducts,
      icon: <AppstoreOutlined />,
      color: "#4f46e5",
    },
    {
      title: "Total Purchases",
      value: computed.totalPurchaseInvoices,
      icon: <ShoppingCartOutlined />,
      color: "#059669",
    },
    {
      title: "Total Sells",
      value: computed.totalSalesInvoices,
      icon: <DollarOutlined />,
      color: "#d97706",
    },
    {
      title: "Total Stock Qty",
      value: computed.totalStockQty,
      icon: <BarChartOutlined />,
      color: "#db2777",
    },
    {
      title: "Cash Balance",
      value: `৳ ${Number(computed.cashBalance).toLocaleString()}`,
      icon: <WalletOutlined />,
      color: "#14b8a6",
    },
    {
      title: "Bank Balance",
      value: `৳ ${Number(computed.bankBalance).toLocaleString()}`,
      icon: <BankOutlined />,
      color: "#f97316",
    },
  ];

  // ✅ Extra summary cards
  const extraStats = [
    {
      title: "Receivable (Customer Due)",
      value: `৳ ${Number(computed.salesDueTotal).toLocaleString()}`,
      icon: <ArrowUpOutlined />,
      color: "#ef4444",
    },
    {
      title: "Payable (Supplier Due)",
      value: `৳ ${Number(computed.purchaseDueTotal).toLocaleString()}`,
      icon: <ArrowDownOutlined />,
      color: "#2563eb",
    },
  ];

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Overview of products, purchases, sells, stock, and balances</p>
        </div>
{/* 
        <Space wrap>
          <Input
            placeholder="Quick search (product/sku)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <RangePicker onChange={(val) => setDateRange(val)} />
          <Button
            danger
            onClick={() => {
              setSearch("");
              setDateRange(null);
            }}
          >
            Reset
          </Button>
        </Space> */}
      </div>

      {/* Error */}
      {isError ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-600">
          Failed to load dashboard data. Please check your API / server and try again.
        </div>
      ) : null}

      {/* Metric Cards */}
      <Row gutter={[16, 16]} className="mb-4">
        {stats.map((s) => (
          <Col key={s.title} xs={24} sm={12} md={8} lg={6}>
            <Card hoverable style={{ borderLeft: `6px solid ${s.color}`, borderRadius: 14 }}>
              <Space align="start">
                <div className="text-3xl" style={{ color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{s.title}</p>
                  <h2 className="text-2xl font-bold text-slate-900">{loading ? "…" : s.value}</h2>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        {extraStats.map((s) => (
          <Col key={s.title} xs={24} md={12}>
            <Card hoverable style={{ borderRadius: 14 }}>
              <Space align="start">
                <div className="text-3xl" style={{ color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{s.title}</p>
                  <h2 className="text-2xl font-bold text-slate-900">{loading ? "…" : s.value}</h2>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="Sales Trend (Last 7 Days)" variant="borderless" style={{ borderRadius: 14 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={computed.chart}>
                <Line type="monotone" dataKey="sales" strokeWidth={2} />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Purchase Trend (Last 7 Days)" variant="borderless" style={{ borderRadius: 14 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={computed.chart}>
                <Bar dataKey="purchase" />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Net Cash Flow (Sales - Purchase)" bordered={false} style={{ borderRadius: 14 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={computed.chart}>
                <Area type="monotone" dataKey="net" strokeWidth={2} />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Sales */}
      <Card title="Recent Sells" className="mb-6" bordered={false} style={{ borderRadius: 14 }}>
        <Table
          columns={recentSalesColumns}
          dataSource={computed.recentSales}
          loading={loading}
          pagination={false}
          scroll={{ x: 1100 }}
          locale={{ emptyText: <Empty description="No sales found" /> }}
        />
      </Card>

      {/* Alerts + Dues */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="Low Stock Alerts (<= 5)" bordered={false} style={{ borderRadius: 14 }}>
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : lowStockFiltered.length === 0 ? (
              <Empty description="No low stock products" />
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {lowStockFiltered.map((item) => (
                  <li key={item._id}>
                    <Badge status="warning" text={`${item.name} (${item.sku}) - ${item.qty} left`} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Out of Stock" bordered={false} style={{ borderRadius: 14 }}>
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : outOfStockFiltered.length === 0 ? (
              <Empty description="No out of stock products" />
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {outOfStockFiltered.map((item) => (
                  <li key={item._id}>
                    <Badge status="error" text={`${item.name} (${item.sku}) - 0 left`} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top Dues (Customer & Supplier)" bordered={false} style={{ borderRadius: 14 }}>
            <div className="mb-3">
              <div className="text-sm font-semibold text-slate-700 mb-2">Customer Due</div>
              <Table
                columns={[
                  { title: "Customer", dataIndex: "customer", key: "customer" },
                  {
                    title: "Due",
                    dataIndex: "amount",
                    key: "amount",
                    width: 140,
                    render: (v) => <Tag color="volcano">৳ {Number(v).toLocaleString()}</Tag>,
                  },
                ]}
                dataSource={computed.topCustomerDue}
                size="small"
                pagination={false}
                loading={loading}
                locale={{ emptyText: <Empty description="No customer due" /> }}
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Supplier Due</div>
              <Table
                columns={[
                  { title: "Supplier", dataIndex: "supplier", key: "supplier" },
                  {
                    title: "Due",
                    dataIndex: "amount",
                    key: "amount",
                    width: 140,
                    render: (v) => <Tag color="blue">৳ {Number(v).toLocaleString()}</Tag>,
                  },
                ]}
                dataSource={computed.topSupplierDue}
                size="small"
                pagination={false}
                loading={loading}
                locale={{ emptyText: <Empty description="No supplier due" /> }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Footer mini note */}
      <div className="text-xs text-slate-400">
        Cash Balance = Total Sales Paid − Total Purchase Paid • Bank Balance = Sales(BANK) − Purchase(BANK)
      </div>
    </div>
  );
};

export default DashboardPage;

"use client";

import React from "react";
import { Row, Col, Card, Space } from "antd";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  WalletOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { DashboardComputed } from "@/src/app/(admin)/page";


type Props = { computed: DashboardComputed; loading: boolean };

const MetricCards: React.FC<Props> = ({ computed, loading }) => {
  const stats = [
    { title: "Total Products", value: computed.totalProducts, icon: <AppstoreOutlined />, color: "#4f46e5" },
    { title: "Total Purchases", value: computed.totalPurchaseInvoices, icon: <ShoppingCartOutlined />, color: "#059669" },
    { title: "Total Sells", value: computed.totalSalesInvoices, icon: <DollarOutlined />, color: "#d97706" },
    { title: "Total Stock Qty", value: computed.totalStockQty, icon: <BarChartOutlined />, color: "#db2777" },
    { title: "Cash Balance", value: `৳ ${Number(computed.cashBalance).toLocaleString()}`, icon: <WalletOutlined />, color: "#14b8a6" },
    { title: "Bank Balance", value: `৳ ${Number(computed.bankBalance).toLocaleString()}`, icon: <BankOutlined />, color: "#f97316" },
  ];

  return (
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
  );
};

export default MetricCards;

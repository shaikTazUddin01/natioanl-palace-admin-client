"use client";

import React from "react";
import { Row, Col, Card, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { DashboardComputed } from "@/src/app/(admin)/page";

type Props = { computed: DashboardComputed; loading: boolean };

const ExtraStatsCards: React.FC<Props> = ({ computed, loading }) => {
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
  );
};

export default ExtraStatsCards;

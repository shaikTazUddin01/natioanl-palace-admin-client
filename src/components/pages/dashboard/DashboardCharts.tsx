"use client";

import React from "react";
import { Row, Col, Card } from "antd";
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
import { DashboardComputed } from "@/src/app/(admin)/page";

const DashboardCharts = ({ computed }: { computed: DashboardComputed }) => {
  return (
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
        <Card title="Net Cash Flow (Sales - Purchase)" variant="borderless" style={{ borderRadius: 14 }}>
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
  );
};

export default DashboardCharts;

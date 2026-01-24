"use client";

import React from "react";
import { Row, Col, Card, Table, Space, Badge } from "antd";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
  WalletOutlined,
  BankOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

// 🔹 Demo JSON
const demoData = {
  stats: [
    { id: 1, title: "Total Products", value: 120, icon: <AppstoreOutlined />, color: "#4f46e5" },
    { id: 2, title: "Total Purchase", value: 450, icon: <ShoppingCartOutlined />, color: "#059669" },
    { id: 3, title: "Total Sales", value: 390, icon: <DollarOutlined />, color: "#d97706" },
    { id: 4, title: "Current Stock", value: 150, icon: <BarChartOutlined />, color: "#db2777" },
    { id: 5, title: "Cash Balance", value: 5000, icon: <WalletOutlined />, color: "#14b8a6" },
    { id: 6, title: "Bank Balance", value: 12000, icon: <BankOutlined />, color: "#f97316" },
  ],
  salesTrend: [
    { day: "Mon", sales: 100, purchase: 80, cashFlow: 50 },
    { day: "Tue", sales: 120, purchase: 90, cashFlow: 70 },
    { day: "Wed", sales: 80, purchase: 70, cashFlow: 60 },
    { day: "Thu", sales: 150, purchase: 110, cashFlow: 90 },
    { day: "Fri", sales: 200, purchase: 130, cashFlow: 120 },
  ],
  recentSales: [
    { key: "1", product: "Product A", quantity: 10, total: 1000 },
    { key: "2", product: "Product B", quantity: 5, total: 500 },
    { key: "3", product: "Product C", quantity: 20, total: 3000 },
  ],
  lowStock: [
    { product: "Product A", remaining: 5 },
    { product: "Product B", remaining: 2 },
    { product: "Product C", remaining: 10 },
  ],
  customerDue: [
    { customer: "Customer 1", amount: 500 },
    { customer: "Customer 2", amount: 200 },
    { customer: "Customer 3", amount: 1000 },
  ],
  cashSummary: [
    { title: "Cash Sales", value: 2000 },
    { title: "Cash Received", value: 1500 },
    { title: "Cash Pending", value: 500 },
  ],
  bankSummary: [
    { title: "Bank Deposits", value: 10000 },
    { title: "Bank Withdrawals", value: 2000 },
    { title: "Bank Balance", value: 8000 },
  ],
};

const salesColumns = [
  { title: "Product", dataIndex: "product", key: "product" },
  { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  { title: "Total Price ($)", dataIndex: "total", key: "total" },
];

const page: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Metric Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {demoData.stats.map((stat) => (
          <Col key={stat.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{ borderLeft: `6px solid ${stat.color}`, borderRadius: 10 }}
            >
              <Space>
                <div className="text-3xl" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-500">{stat.title}</p>
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card title="Sales Trend" variant="borderless">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={demoData.salesTrend}>
                <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Purchase Trend" variant="borderless">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demoData.salesTrend}>
                <Bar dataKey="purchase" fill="#059669" />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Cash Flow" variant="borderless">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={demoData.salesTrend}>
                <Area type="monotone" dataKey="cashFlow" stroke="#d97706" fill="#fef3c7" />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Sales Table */}
      <Card title="Recent Sales" className="mb-6" variant="borderless">
        <Table columns={salesColumns} dataSource={demoData.recentSales} pagination={false} />
      </Card>

      {/* Alerts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Low Stock Alerts" variant="borderless">
            <ul className="list-disc pl-5">
              {demoData.lowStock.map((item) => (
                <li key={item.product}>
                  <Badge status="error" text={`${item.product} - ${item.remaining} units left`} />
                </li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Customer Due" variant="borderless">
            <ul className="list-disc pl-5">
              {demoData.customerDue.map((item) => (
                <li key={item.customer}>
                  <Badge status="warning" text={`${item.customer} - $${item.amount}`} />
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>

      {/* Cash & Bank Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Cash Summary" variant="borderless">
            <ul className="list-disc pl-5">
              {demoData.cashSummary.map((item) => (
                <li key={item.title}>
                  {item.title}: ${item.value}
                </li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Bank Summary" variant="borderless">
            <ul className="list-disc pl-5">
              {demoData.bankSummary.map((item) => (
                <li key={item.title}>
                  {item.title}: ${item.value}
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default page;

"use client";

import React from "react";
import { Row, Col, Card, Empty, Badge, Table, Tag } from "antd";

type Props = {
  loading: boolean;
  lowStockFiltered: { _id: string; name: string; sku: string; qty: number }[];
  outOfStockFiltered: { _id: string; name: string; sku: string; qty: number }[];
  topCustomerDue: { key: string; customer: string; amount: number }[];
  topSupplierDue: { key: string; supplier: string; amount: number }[];
};

const StockAndDues: React.FC<Props> = ({
  loading,
  lowStockFiltered,
  outOfStockFiltered,
  topCustomerDue,
  topSupplierDue,
}) => {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} lg={8}>
        <Card title="Low Stock Alerts (<= 5)" variant="borderless" style={{ borderRadius: 14 }}>
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
        <Card title="Out of Stock" variant="borderless" style={{ borderRadius: 14 }}>
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
              dataSource={topCustomerDue}
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
              dataSource={topSupplierDue}
              size="small"
              pagination={false}
              loading={loading}
              locale={{ emptyText: <Empty description="No supplier due" /> }}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default StockAndDues;

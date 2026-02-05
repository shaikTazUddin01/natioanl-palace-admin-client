"use client";

import { Card, Col, Row, Statistic } from "antd";

type Props = {
  totalItems: number;
  low: number;
  out: number;
  totalPurchaseValue: number;
};

export default function StockSummary({
  totalItems,
  low,
  out,
  totalPurchaseValue,
}: Props) {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} md={6}>
        <Card>
          <Statistic title="Total Products" value={totalItems} />
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card>
          <Statistic title="Low Stock" value={low} />
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card>
          <Statistic title="Out of Stock" value={out} />
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card>
          <Statistic
            title="Stock Value (Purchase)"
            value={totalPurchaseValue}
            formatter={(v) => `৳ ${Number(v).toLocaleString()}`}
          />
        </Card>
      </Col>
    </Row>
  );
}

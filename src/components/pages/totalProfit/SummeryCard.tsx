"use client";

import { ProfitSummary } from "@/src/types";
import { money } from "@/src/utils/money.utils";
import { Card, Col, Row, Statistic } from "antd";
import dayjs from "dayjs";


export default function ProfitSummaryCards({ summary }: { summary: ProfitSummary }) {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} md={6}>
        <Card>
          <Statistic
            title="Total Profit"
            value={summary.totalProfit}
            formatter={(v) => money(Number(v))}
          />
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card>
          <Statistic title="Total Sold Qty" value={summary.totalSoldQty} />
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card>
          <Statistic
            title="Total Revenue"
            value={summary.totalRevenue}
            formatter={(v) => money(Number(v))}
          />
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card>
          <Statistic
            title="Best Month"
            value={
              summary.bestMonth === "-"
                ? "-"
                : dayjs(`${summary.bestMonth}-01`).format("MMM YYYY")
            }
            suffix={
              summary.bestMonth === "-"
                ? null
                : (
                  <span className="ml-2 text-slate-500">
                    ({money(summary.bestMonthProfit)})
                  </span>
                )
            }
          />
        </Card>
      </Col>
    </Row>
  );
}
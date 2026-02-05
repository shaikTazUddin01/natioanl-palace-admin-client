export type MonthlyProfitRow = {
  key: string; // YYYY-MM
  month: string; // YYYY-MM
  totalSoldQty: number;
  revenue: number;
  cogs: number;
  profit: number;
};

export type ProfitSummary = {
  totalProfit: number;
  totalSoldQty: number;
  totalRevenue: number;
  totalCogs: number;
  bestMonth: string; // YYYY-MM or "-"
  bestMonthProfit: number;
};

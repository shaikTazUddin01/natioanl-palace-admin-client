import { StockStatus } from "../types";

export const lowStockLimit = 5;

export const safeNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const statusFromQty = (qty: number): StockStatus => {
  if (qty <= 0) return "Out of Stock";
  if (qty <= lowStockLimit) return "Low Stock";
  return "In Stock";
};

export const statusColor = (qty: number) => {
  if (qty <= 0) return "red";
  if (qty <= lowStockLimit) return "gold";
  return "green";
};

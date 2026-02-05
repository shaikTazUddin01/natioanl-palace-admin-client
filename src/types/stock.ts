export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type TStockRow = {
  key: string;
  _id?: string;

  productName: string;
  sku: string;
  category: string;

  purchasePrice: number;
  salePrice: number;

  stockIn: number;
  stockOut: number;
  currentStock: number;

  status: StockStatus;

  note?: string;
};

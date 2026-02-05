export const money = (n: number) => `৳ ${Number(n || 0).toLocaleString()}`;

export const normalize = (s: any) => String(s ?? "").trim().toLowerCase();

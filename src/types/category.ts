export type TCategoryRow = {
  key: string;
  _id?: string;
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
};

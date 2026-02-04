"use client";

import React from "react";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  dateRange: any;
  setDateRange: (v: any) => void;
};

const DashboardHeader: React.FC<Props> = () => {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Overview of products, purchases, sells, stock, and balances</p>
      </div>

     
    </div>
  );
};

export default DashboardHeader;

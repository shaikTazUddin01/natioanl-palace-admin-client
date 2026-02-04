"use client";

import React from "react";

const DashboardError = ({ isError }: { isError: boolean }) => {
  if (!isError) return null;

  return (
    <div className="p-4 rounded-xl bg-red-50 text-red-600 mb-4">
      Failed to load dashboard data. Please check your API / server and try again.
    </div>
  );
};

export default DashboardError;

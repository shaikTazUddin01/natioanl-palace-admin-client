"use client";

import React from "react";

export default function LoadingLayout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-6" />

      {/* Loading skeleton */}
      <div className="w-1/3 h-6 bg-slate-200 rounded mb-4 animate-pulse" />
      <div className="w-2/3 h-6 bg-slate-200 rounded mb-4 animate-pulse" />
      <div className="w-full h-40 bg-slate-200 rounded animate-pulse" />
    </div>
  );
}

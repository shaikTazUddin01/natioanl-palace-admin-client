"use client";

import { useMemo, useState } from "react";

import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";
import { useGetPurchasesQuery } from "@/src/redux/features/purchase/purchaseApi";
import { PaymentRow } from "@/src/types";
import { buildAllRows, buildSummary } from "@/src/utils/account.utils";
import TotalAccountHeader from "@/src/components/pages/account/TotalAccountHeader";
import TotalAccountSummary from "@/src/components/pages/account/TotalAccountSummary";
import TotalAccountFilters from "@/src/components/pages/account/TotalAccountFilters";
import TotalAccountTable from "@/src/components/pages/account/TotalAccountTable";
import { accountColumns } from "@/src/components/pages/account/columns";


export default function TotalAccountPageClient() {
  // filters
  const [partyQuery, setPartyQuery] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [date, setDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"SALE" | "PURCHASE" | undefined>(
    undefined
  );

  // ✅ API data
  const {
    data: salesRes,
    isLoading: salesLoading,
    isFetching: salesFetching,
    isError: salesError,
  } = useGetSalesQuery(undefined);

  const {
    data: purchaseRes,
    isLoading: purchaseLoading,
    isFetching: purchaseFetching,
    isError: purchaseError,
  } = useGetPurchasesQuery(undefined);

  const rawSales = salesRes?.data ?? salesRes ?? [];
  const rawPurchases = purchaseRes?.data ?? purchaseRes ?? [];

  const allRows: PaymentRow[] = useMemo(
    () => buildAllRows(rawSales, rawPurchases),
    [rawSales, rawPurchases]
  );

  const summary = useMemo(
    () => buildSummary(rawSales, rawPurchases),
    [rawSales, rawPurchases]
  );

  const filteredData = useMemo(() => {
    const partyQ = partyQuery.trim().toLowerCase();
    const invoiceQ = invoiceQuery.trim().toLowerCase();

    return allRows.filter((row) => {
      const matchParty = !partyQ || row.partyName.toLowerCase().includes(partyQ);
      const matchInvoice = !invoiceQ || row.invoiceNo.toLowerCase().includes(invoiceQ);
      const matchDate = !date || row.date === date;
      const matchType = !typeFilter || row.type === typeFilter;

      return matchParty && matchInvoice && matchDate && matchType;
    });
  }, [allRows, partyQuery, invoiceQuery, date, typeFilter]);

  const loading = salesLoading || salesFetching || purchaseLoading || purchaseFetching;
  const isError = !!salesError || !!purchaseError;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <TotalAccountHeader/>
 
      <TotalAccountSummary summary={summary} />

      <TotalAccountFilters
        partyQuery={partyQuery}
        setPartyQuery={setPartyQuery}
        invoiceQuery={invoiceQuery}
        setInvoiceQuery={setInvoiceQuery}
        setDate={setDate}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onReset={() => {
          setPartyQuery("");
          setInvoiceQuery("");
          setDate(null);
          setTypeFilter(undefined);
        }}
      />

      <TotalAccountTable
        columns={accountColumns}
        data={filteredData}
        loading={loading}
        isError={isError}
      />
    </div>
  );
}

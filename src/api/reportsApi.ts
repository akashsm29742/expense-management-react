import httpClient from "./httpClient";
import type { Expense } from "./expenseApi";

type ExpensesResponse = Expense[] | { data: Expense[] };

export async function getExpensesReportApi(): Promise<Expense[]> {
  const res = await httpClient.get<ExpensesResponse>("/reports/expenses");
  const data = res.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
}

export async function exportExpensesCsvApi(): Promise<Blob> {
  const res = await httpClient.get("/reports/expenses/export", {
    responseType: "blob", // CSV
  });
  return res.data;
}

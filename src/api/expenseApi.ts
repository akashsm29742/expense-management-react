import httpClient from "./httpClient";

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Expense {
  _id: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  status: ExpenseStatus;
  employee: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateExpenseRequest {
  category: string;
  amount: number;
  currency: string;
  description: string;
}

export async function createExpenseApi(
  payload: CreateExpenseRequest
): Promise<Expense> {
  const res = await httpClient.post<Expense>("/expenses", payload);
  return res.data;
}

export async function approveExpenseApi(expenseId: string, comment: string) {
  const res = await httpClient.post<Expense>(`/expenses/${expenseId}/approve`, {
    comment,
  });
  return res.data;
}

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  exportExpensesCsvApi,
  getExpensesReportApi,
} from "../../api/reportsApi";
import type { Expense } from "../../api/expenseApi";
import { PERMISSIONS } from "../../auth/permissions";

export default function ReportsDashboardPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canExport = user?.permissions?.includes(PERMISSIONS.EXPORT_REPORTS);

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        setLoading(true);
        const data = await getExpensesReportApi();
        setExpenses(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportExpensesCsvApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export CSV", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h2 className="page-title">Dashboard</h2>

        {canExport && (
          <button
            className="btn btn--primary"
            type="button"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        )}
      </div>
      <p>
        Logged in as <strong>{user?.name}</strong>
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && expenses.length === 0 && <p>No expenses found.</p>}

      {!loading && !error && expenses.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id}>
                <td>{e.employee.name ?? "-"}</td>
                <td>{e.category}</td>
                <td>
                  {e.amount} {e.currency}
                </td>
                <td>{e.status}</td>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

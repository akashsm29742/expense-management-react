import { useEffect, useState } from "react";
import { getExpensesReportApi } from "../../api/reportsApi";
import {
  approveExpenseApi,
  rejectExpenseApi,
  type Expense,
} from "../../api/expenseApi";
import { useAuth } from "../../context/AuthContext";

export default function ApprovalListPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await getExpensesReportApi();
      // Show only pending
      setExpenses(data.filter((e) => e.status === "PENDING"));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleApprove = async (id: string) => {
    const comment = `Approved by ${user?.name} (${user?.roleName}) - with ID ${user?.id}`;
    try {
      setApprovingId(id);
      await approveExpenseApi(id, comment);
      await loadExpenses();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to approve expense");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const comment = `Rejected by ${user?.name} (${user?.roleName}) - with ID ${user?.id}`;
    try {
      setApprovingId(id);
      await rejectExpenseApi(id, comment);
      await loadExpenses();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reject expense");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div>
      <h2>Pending Approvals</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && expenses.length === 0 && <p>No pending expenses.</p>}

      {!loading && expenses.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Submitted On</th>
              <th>Action</th>
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
                <td>{e.description}</td>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn--ghost-light"
                    onClick={() => handleApprove(e._id)}
                    disabled={approvingId === e._id}
                  >
                    {approvingId === e._id ? "Approving..." : "Approve"}
                  </button>{" "}
                  <button
                    className="btn btn--ghost-light"
                    onClick={() => handleReject(e._id)}
                    disabled={approvingId === e._id}
                  >
                    {approvingId === e._id ? "Rejecting..." : "Reject"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

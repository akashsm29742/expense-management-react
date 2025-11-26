import { type FormEvent, useState, useEffect } from "react";
import { createExpenseApi } from "../../api/expenseApi";
import { listCategoriesApi, type Category } from "../../api/categoriesApi";

export default function ExpenseFormPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState("INR");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await listCategoriesApi();
        setCategories(data);
        if (data.length > 0) {
          setCategory(data[0].name);
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    })();
  }, []);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (amount === "" || Number(amount) <= 0) {
      errs.amount = "Amount must be greater than 0";
    }
    if (!description.trim()) {
      errs.description = "Description is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    try {
      setLoading(true);
      await createExpenseApi({
        category,
        amount: Number(amount),
        currency,
        description,
      });
      setSuccess("Expense created successfully");
      setDescription("");
      setAmount("");
      setFieldErrors({});
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title">Submit Expense</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__group">
          <label className="form__label">Category</label>
          <select
            className="form__control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label">Amount</label>
          <input
            className="form__control"
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          {fieldErrors.amount && (
            <span className="form__error">{fieldErrors.amount}</span>
          )}
        </div>

        <div className="form__group">
          <label className="form__label">Currency</label>
          <input
            className="form__control"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div className="form__group">
          <label className="form__label">Description</label>
          <textarea
            className="form__control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {fieldErrors.description && (
            <span className="form__error">{fieldErrors.description}</span>
          )}
        </div>

        {error && <p className="form__error">{error}</p>}
        {success && <p className="form__success">{success}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Expense"}
        </button>
      </form>
    </>
  );
}

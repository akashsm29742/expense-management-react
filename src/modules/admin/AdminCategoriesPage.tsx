import { useEffect, useState, type FormEvent } from "react";
import {
  listCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  type Category,
} from "../../api/categoriesApi";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});

  const loadCategories = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await listCategoriesApi();
      setCategories(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) {
      errs.name = "Name is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    try {
      setSaving(true);
      await createCategoryApi({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      setFieldErrors({});
      await loadCategories();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    setError(null);
    try {
      // Optimistic update
      setCategories((prev) =>
        prev.map((c) =>
          c._id === cat._id
            ? { ...c, active: cat.active === false ? true : !c.active }
            : c
        )
      );
      await updateCategoryApi(cat._id, {
        active: cat.active === false ? true : !cat.active,
      });
      await loadCategories();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    setError(null);
    try {
      await deleteCategoryApi(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div>
      <h2 className="page-title">Category Management</h2>

      {error && <p className="form__error">{error}</p>}

      {/* Create category */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.75rem", fontWeight: 600 }}>
          Create Category
        </h3>
        <form className="form" onSubmit={handleCreateCategory}>
          <div className="form__group">
            <label className="form__label">Name</label>
            <input
              className="form__control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name && (
              <span className="form__error">{fieldErrors.name}</span>
            )}
          </div>

          <div className="form__group">
            <label className="form__label">Description (optional)</label>
            <textarea
              className="form__control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Category"}
          </button>
        </form>
      </section>

      {/* List categories */}
      <section>
        <h3 style={{ marginBottom: "0.75rem", fontWeight: 600 }}>
          Existing Categories
        </h3>

        {loading && <p>Loading categories...</p>}
        {!loading && categories.length === 0 && <p>No categories found.</p>}

        {!loading && categories.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.description || "-"}</td>
                  <td>{c.active === false ? "No" : "Yes"}</td>
                  <td>
                    <button
                      className="btn btn--ghost-light"
                      type="button"
                      onClick={() => handleToggleActive(c)}
                    >
                      {c.active === false ? "Activate" : "Deactivate"}
                    </button>{" "}
                    <button
                      className="btn btn--ghost-light"
                      type="button"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

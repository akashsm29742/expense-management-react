import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type User } from "../../context/AuthContext";
import { loginApi } from "../../api/authApi";
import type { Role, Permission } from "../../auth/permissions";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "Email is required";
    if (!password.trim()) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login({
        user: {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          roleName: ((res.user as User).roleName as Role) ?? "GUEST",
          roleId: res.user.roleId,
          permissions: (res.user.permissions as Permission[]) ?? [],
        },
        token: res.token,
      });
      navigate("/reports", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__group">
          <label className="form__label">Email</label>
          <input
            className="form__control"
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && (
            <span className="form__error">{fieldErrors.email}</span>
          )}
        </div>

        <div className="form__group">
          <label className="form__label">Password</label>
          <input
            className="form__control"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && (
            <span className="form__error">{fieldErrors.password}</span>
          )}
        </div>

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

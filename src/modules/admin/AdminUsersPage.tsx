import { useEffect, useState, type FormEvent } from "react";
import {
  listUsersApi,
  createUserApi,
  changeUserRoleApi,
  type UserDto,
  type RoleName,
} from "../../api/usersApi";
import { listRolesApi, type RoleDto } from "../../api/rolesApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [roleName, setRoleName] = useState<RoleName>("EMPLOYEE");
  const [managerId, setManagerId] = useState<string>("");

  const loadUsers = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await listUsersApi();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await listRolesApi();
      setRoles(data);
    } catch (err: any) {
      // Don’t override existing error if set by users load, but show something
      setError(
        (prev) =>
          prev ?? (err?.response?.data?.message || "Failed to load roles")
      );
    }
  };

  useEffect(() => {
    // load users + roles in parallel
    loadUsers();
    loadRoles();
  }, []);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);
      await createUserApi({
        name,
        email,
        password,
        roleName,
        managerId: managerId || undefined,
      });
      setName("");
      setEmail("");
      setPassword("Password@123");
      setRoleName("EMPLOYEE");
      setManagerId("");
      await loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: RoleName) => {
    setError(null);
    try {
      await changeUserRoleApi(userId, newRole);
      await loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to change role");
    }
  };

  return (
    <div>
      <h2 className="page-title">User Management</h2>

      {error && <p className="form__error">{error}</p>}

      <section style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.75rem", fontWeight: 600 }}>
          Create User
        </h3>
        <form className="form" onSubmit={handleCreateUser}>
          <div className="form__group">
            <label className="form__label">Name</label>
            <input
              className="form__control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form__group">
            <label className="form__label">Email</label>
            <input
              className="form__control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form__group">
            <label className="form__label">Password</label>
            <input
              className="form__control"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form__group">
            <label className="form__label">Role</label>
            <select
              className="form__control"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value as RoleName)}
            >
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label">Manager (optional)</label>
            <select
              className="form__control"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            >
              <option value="">-- None --</option>
              {users
                .filter((u) => {
                  return u.role.permissions.includes("APPROVE_EXPENSE");
                })
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role.name})
                  </option>
                ))}
            </select>
          </div>

          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create User"}
          </button>
        </form>
      </section>

      <section>
        <h3 style={{ marginBottom: "0.75rem", fontWeight: 600 }}>Users</h3>
        {loading && <p>Loading users...</p>}
        {!loading && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager Name</th>
                <th>Manager Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role.name}</td>
                  <td>
                    {u.manager
                      ? users.find((m) => m._id === u.manager._id)?.name ?? "-"
                      : "-"}
                  </td>
                  <td>
                    {u.manager
                      ? users.find((m) => m._id === u.manager._id)?.role.name ??
                        "-"
                      : "-"}
                  </td>
                  <td>
                    <select
                      className="form__control"
                      value={u.role.name}
                      onChange={(e) =>
                        handleChangeRole(u._id, e.target.value as RoleName)
                      }
                    >
                      {roles.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
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

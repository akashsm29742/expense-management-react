import { useEffect, useState } from "react";
import {
  listRolesApi,
  setRolePermissionsApi,
  type RoleDto,
} from "../../api/rolesApi";
import { PERMISSIONS, type Permission } from "../../auth/permissions";

const ALL_PERMISSIONS: Permission[] = [
  PERMISSIONS.SUBMIT_EXPENSE,
  PERMISSIONS.VIEW_TEAM_EXPENSES,
  PERMISSIONS.APPROVE_EXPENSE,
  PERMISSIONS.VIEW_ALL_EXPENSES,
  PERMISSIONS.EXPORT_REPORTS,
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_CATEGORIES,
  PERMISSIONS.MANAGE_ROLES,
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await listRolesApi();
      setRoles(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const togglePermission = (roleName: string, permission: Permission) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.name === roleName
          ? {
              ...r,
              permissions: r.permissions.includes(permission)
                ? r.permissions.filter((p) => p !== permission)
                : [...r.permissions, permission],
            }
          : r
      )
    );
  };

  const handleSavePermissions = async (roleName: string) => {
    const role = roles.find((r) => r.name === roleName);
    if (!role) return;

    setError(null);
    setSavingRole(roleName);
    try {
      await setRolePermissionsApi(roleName, role.permissions);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update permissions");
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <div>
      <h2 className="page-title">Role & Permissions Management</h2>

      {error && <p className="form__error">{error}</p>}

      {loading && <p>Loading roles...</p>}
      {!loading && roles.length === 0 && <p>No roles found.</p>}

      {!loading && roles.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.name}>
                <td>{role.name}</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {ALL_PERMISSIONS.map((perm) => {
                      const checked = role.permissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.8rem",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "999px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: checked ? "#111827" : "#f9fafb",
                            color: checked ? "#f9fafb" : "#111827",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(role.name, perm)}
                            style={{ margin: 0 }}
                          />
                          <span>{perm}</span>
                        </label>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() => handleSavePermissions(role.name)}
                    disabled={savingRole === role.name}
                  >
                    {savingRole === role.name ? "Saving..." : "Save"}
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

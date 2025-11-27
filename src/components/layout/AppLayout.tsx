import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Permission } from "../../auth/permissions";
import { PERMISSIONS } from "../../auth/permissions";

export default function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const permissions: Permission[] = user?.permissions ?? [];

  const hasPermission = (perm: Permission) => permissions.includes(perm);

  const getLinkClass = (isActive: boolean) =>
    `sidebar-link${isActive ? " sidebar-link--active" : ""}`;

  // EXPENSE MENU VISIBILITY
  const canSeeSubmitExpense = hasPermission(PERMISSIONS.SUBMIT_EXPENSE);
  // Manager (or any role) that can approve
  const canSeeApprovals = hasPermission(PERMISSIONS.APPROVE_EXPENSE);

  // ADMIN MENU VISIBILITY (permission-based, not hardcoded role)
  const canSeeUserManagement = hasPermission(PERMISSIONS.MANAGE_USERS);
  const canSeeCategoryManagement = hasPermission(PERMISSIONS.MANAGE_CATEGORIES);
  const canSeeRoleManagement = hasPermission(PERMISSIONS.MANAGE_ROLES);

  const showAdminSection =
    canSeeUserManagement || canSeeCategoryManagement || canSeeRoleManagement;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-header__title">Expense Management</h1>
        <div className="app-header__user">
          <span>
            {user?.name} ({user?.roleName})
          </span>
          <button className="btn btn--ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar__section-title">MAIN</div>
          <nav className="sidebar__nav">
            <NavLink
              to="/reports"
              className={({ isActive }) => getLinkClass(isActive)}
            >
              Dashboard
            </NavLink>

            {(canSeeSubmitExpense || canSeeApprovals) && (
              <>
                <div className="sidebar__section-title">EXPENSES</div>
                {canSeeSubmitExpense && (
                  <NavLink
                    to="/expenses/new"
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    Submit Expense
                  </NavLink>
                )}
                {canSeeApprovals && (
                  <NavLink
                    to="/approvals"
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    Approvals
                  </NavLink>
                )}
              </>
            )}

            {showAdminSection && (
              <>
                <div className="sidebar__section-title">ADMIN</div>

                {canSeeUserManagement && (
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    User Management
                  </NavLink>
                )}

                {canSeeCategoryManagement && (
                  <NavLink
                    to="/admin/categories"
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    Category Management
                  </NavLink>
                )}

                {canSeeRoleManagement && (
                  <NavLink
                    to="/admin/roles"
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    Role & Permissions
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </aside>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

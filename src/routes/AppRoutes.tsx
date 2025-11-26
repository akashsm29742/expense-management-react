import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import AppLayout from "../components/layout/AppLayout";
import RequireRole from "../components/layout/RequireRole";

import LoginPage from "../modules/auth/LoginPage";
import ExpenseFormPage from "../modules/expenses/ExpenseFormPage";
import ApprovalListPage from "../modules/approvals/ApprovalListPage";
import ReportsDashboardPage from "../modules/reports/ReportsDashboardPage";

import AdminUsersPage from "../modules/admin/AdminUsersPage";
import AdminCategoriesPage from "../modules/admin/AdminCategoriesPage";
import AdminRolesPage from "../modules/admin/AdminRolesPage";

import { PERMISSIONS } from "../auth/permissions";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth-only layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* App layout (checks isAuthenticated inside AppLayout) */}
        <Route element={<AppLayout />}>
          {/* All authenticated users can see Dashboard; backend & permissions decide scope */}
          <Route path="/reports" element={<ReportsDashboardPage />} />

          {/* Only users with SUBMIT_EXPENSE can submit expenses */}
          <Route
            element={
              <RequireRole requiredPermissions={[PERMISSIONS.SUBMIT_EXPENSE]} />
            }
          >
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
          </Route>

          {/* Only users with APPROVE_EXPENSE can see approvals */}
          <Route
            element={
              <RequireRole
                requiredPermissions={[PERMISSIONS.APPROVE_EXPENSE]}
              />
            }
          >
            <Route path="/approvals" element={<ApprovalListPage />} />
          </Route>

          {/* ADMIN / management routes – guarded purely by permissions */}
          <Route
            element={
              <RequireRole requiredPermissions={[PERMISSIONS.MANAGE_USERS]} />
            }
          >
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route
            element={
              <RequireRole
                requiredPermissions={[PERMISSIONS.MANAGE_CATEGORIES]}
              />
            }
          >
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          </Route>

          <Route
            element={
              <RequireRole requiredPermissions={[PERMISSIONS.MANAGE_ROLES]} />
            }
          >
            <Route path="/admin/roles" element={<AdminRolesPage />} />
          </Route>

          {/* default redirect */}
          <Route path="/" element={<Navigate to="/reports" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

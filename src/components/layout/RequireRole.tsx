import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role, Permission } from "../../auth/permissions";
import { useAuth } from "../../context/AuthContext";

interface RequireRoleProps {
  // This is optional list of roles that are allowed to access this route. If provided, user.roleName must be in this list.
  allowedRoles?: Role[];

  // This is optional list of permissions required for this route. If provided, user.permissions must contain at least one of these.
  requiredPermissions?: Permission[];
}

export default function RequireRole({
  allowedRoles,
  requiredPermissions,
}: RequireRoleProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in - go to login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/" }}
      />
    );
  }

  let isAllowed = true;

  // If roles are specified, user must match one of them
  if (allowedRoles && allowedRoles.length > 0) {
    isAllowed = isAllowed && allowedRoles.includes(user.roleName);
  }

  // If permissions are specified, user must have at least one of them
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAnyPermission = requiredPermissions.some((perm) =>
      user.permissions.includes(perm)
    );
    isAllowed = isAllowed && hasAnyPermission;
  }

  // If no roles/permissions were passed, we consider it "no extra restriction"
  // and just require the user to be logged in (handled above).

  if (!isAllowed) {
    return <div>403 – You do not have permission to view this page.</div>;
  }

  return <Outlet />;
}

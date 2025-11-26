import httpClient from "./httpClient";
import type { Permission, Role } from "../context/AuthContext";

export interface RoleDto {
  name: Role;
  permissions: Permission[];
}

type RolesResponse = RoleDto[] | { data: RoleDto[] };

export async function listRolesApi(): Promise<RoleDto[]> {
  const res = await httpClient.get<RolesResponse>("/admin/roles");
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
}

export async function setRolePermissionsApi(
  roleName: Role,
  permissions: Permission[]
) {
  await httpClient.patch(`/admin/roles/${roleName}/permissions`, {
    permissions,
  });
}

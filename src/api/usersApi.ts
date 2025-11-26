import httpClient from "./httpClient";

export type RoleName = "EMPLOYEE" | "MANAGER" | "ADMIN";

export interface UserDto {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: RoleName;
  };
  manager: {
    _id: string;
    name: string;
    email: string;
  };
}

type UsersResponse = UserDto[] | { data: UserDto[] };

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleName: RoleName;
  managerId?: string;
}

export async function createUserApi(
  payload: CreateUserRequest
): Promise<UserDto> {
  const res = await httpClient.post<{ data: UserDto }>("/admin/users", payload);
  return res.data.data;
}

export async function listUsersApi(): Promise<UserDto[]> {
  const res = await httpClient.get<UsersResponse>("/admin/users");
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
}

export async function changeUserRoleApi(userId: string, roleName: RoleName) {
  await httpClient.patch(`/admin/users/${userId}/role`, { roleName });
}

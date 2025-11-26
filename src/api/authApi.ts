import httpClient from "./httpClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  roleId: string;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const res = await httpClient.post<LoginResponse>("/auth/login", payload);
  return res.data;
}

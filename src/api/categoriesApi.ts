import httpClient from "./httpClient";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  active?: boolean;
}

type CategoriesResponse = Category[] | { data: Category[] };

export async function listCategoriesApi(): Promise<Category[]> {
  const res = await httpClient.get<CategoriesResponse>("/admin/categories");
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
}

export async function createCategoryApi(payload: {
  name: string;
  description?: string;
}) {
  const res = await httpClient.post<{ data: Category }>(
    "/admin/categories",
    payload
  );
  return res.data.data;
}

export async function updateCategoryApi(
  id: string,
  payload: Partial<Pick<Category, "description" | "active">>
) {
  await httpClient.patch(`/admin/categories/${id}`, payload);
}

export async function deleteCategoryApi(id: string) {
  await httpClient.delete(`/admin/categories/${id}`);
}

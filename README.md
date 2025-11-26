# Expense Management Frontend (React)

This is the React frontend for the **Expense Management System**.  
It provides:

- Employee expense submission
- Manager approvals
- Role-based dashboards and reporting
- Admin management of users, roles/permissions, and expense categories

The app is designed to work with a Node.js backend that exposes REST APIs (auth, expenses, reports, admin).

---

## 1. Prerequisites

Make sure you have:

- **Node.js** >= 18.x
- **npm** >= 9.x (or `pnpm` / `yarn` if you prefer, adapt commands accordingly)
- Backend server for this project running (typically on `http://localhost:4000`)

> All commands below assume **npm**. If you use `yarn` or `pnpm`, swap accordingly.

---

## 2. Getting Started

### 2.1. Clone the repository

```bash
git clone <your-frontend-repo-url>.git
cd <your-frontend-repo-folder>
```

### 2.2. Install dependencies

```bash
npm install
```

---

## 3. Environment Configuration

The app expects an environment variable for the backend API URL.

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

- `VITE_API_BASE_URL` should point to your backend API root.
- For example, if your backend serves routes like `http://localhost:4000/api/auth/login`, this value is correct.

> **Important:** For Vite, env variables must start with `VITE_`.

---

## 4. Running the App in Development

Start the dev server:

```bash
npm run dev
```

By default, Vite will start the app at something like:

- `http://localhost:5173` (or another free port)

Open that URL in your browser to access the app.

---

## 5. Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate static assets in the `dist` folder.

To locally preview the production build:

```bash
npm run preview
```

This starts a local server that serves the compiled `dist` bundle.

---

## 6. Project Structure (High-Level)

Project will look roughly like this:

```text
src/
  api/
    authApi.ts
    expenseApi.ts
    reportsApi.ts
    usersApi.ts
    categoriesApi.ts
    rolesApi.ts
    httpClient.ts
  auth/
    permissions.ts
  components/
    layout/
      AppLayout.tsx
      AuthLayout.tsx
      RequireRole.tsx
  context/
    AuthContext.tsx
  modules/
    auth/
      LoginPage.tsx
    expenses/
      ExpenseFormPage.tsx
    approvals/
      ApprovalListPage.tsx
    reports/
      ReportsDashboardPage.tsx
    admin/
      AdminUsersPage.tsx
      AdminCategoriesPage.tsx
      AdminRolesPage.tsx
  routes/
    AppRoutes.tsx
  styles/
    layout.css
    components.css
  main.tsx
  App.tsx
```

Key points:

- **API layer** (`src/api`) contains all HTTP helpers.
- **AuthContext** holds the currently logged-in user, `roleName`, and `permissions[]`.
- **Layouts** handle global shell (header + sidebar) and auth layout.
- **Modules** contain feature pages for each area.
- **Routes** define navigation and permission guards.

---

## 7. Authentication, Roles & Permissions

### 7.1. Login

The login page is available at:

- `/login`

The login form calls `POST /auth/login` on the backend and expects a response with:

- `token` (access token, stored in `localStorage` as `accessToken`)
- `user` object including:
  - `id`
  - `name`
  - `email`
  - `roleName` (e.g. `EMPLOYEE`, `MANAGER`, `FINANCE`, `CA`, `HR`, `ADMIN`, `CEO`, `CTO`)
  - `permissions` (array of permission strings)

The frontend stores this in `AuthContext` and in `localStorage` for persistence across refreshes.

### 7.2. Permissions

The frontend defines the same permission constants as the backend in `src/auth/permissions.ts`:

- `SUBMIT_EXPENSE`
- `VIEW_TEAM_EXPENSES`
- `APPROVE_EXPENSE`
- `VIEW_ALL_EXPENSES`
- `EXPORT_REPORTS`
- `MANAGE_USERS`
- `MANAGE_CATEGORIES`
- `MANAGE_ROLES`

Routes and menu items are guarded based on these permissions.

### 7.3. Route Protection

`RequireRole` is a small wrapper that checks:

- Whether the user is logged in
- Whether the user has any of the required permissions for a route

Example usage in `AppRoutes.tsx`:

- To restrict `/expenses/new` to users who can submit expenses:
  - `requiredPermissions: [PERMISSIONS.SUBMIT_EXPENSE]`
- To restrict `/admin/users` to users who can manage users:
  - `requiredPermissions: [PERMISSIONS.MANAGE_USERS]`

The backend should also enforce permissions, but the frontend guard improves UX.

---

## 8. Navigation & Features

Once logged in, you’ll see the main app layout with:

### 8.1. Dashboard (Reports)

- **Route**: `/reports`
- **Sidebar**: `Dashboard`
- Shows a table of expenses:
  - For employees: their own expenses
  - For managers: their team’s expenses
  - For finance/CA/CEO/CTO/admin roles: organization-wide view (depending on backend rules)
- Users with `EXPORT_REPORTS` permission will see an **“Export CSV”** button that downloads a CSV via `GET /reports/expenses/export`.

### 8.2. Submit Expense

- **Route**: `/expenses/new`
- **Permission**: `SUBMIT_EXPENSE`
- Allows employees to submit new reimbursement requests with:
  - Category (fetched from backend categories)
  - Amount
  - Currency
  - Description

On submit:

- Calls `POST /expenses`
- Backend triggers notification (email simulation) on submission
- Page shows success / error messages.

### 8.3. Approvals

- **Route**: `/approvals`
- **Permission**: `APPROVE_EXPENSE`
- Intended for line managers (or any role allowed to approve).
- Shows only pending expenses.
- “Approve” buttons call `POST /expenses/:expenseId/approve`.
- Backend triggers notifications on approval/rejection.

### 8.4. Admin – User Management

- **Route**: `/admin/users`
- **Permission**: `MANAGE_USERS`
- Features:
  - List all users with current role and manager.
  - Create new user:
    - Name, email, password, role, optional manager.
    - Role dropdown is populated from `GET /admin/roles`.
  - Change user role via dropdown:
    - Calls `PATCH /admin/users/:userId/role`.
  - Backend may send notifications on role changes.

### 8.5. Admin – Category Management

- **Route**: `/admin/categories`
- **Permission**: `MANAGE_CATEGORIES`
- Features:
  - Create new expense categories (name + optional description).
  - List existing categories.
  - Activate/deactivate categories.
  - Delete categories.

These categories are used on the “Submit Expense” page.

### 8.6. Admin – Roles & Permissions

- **Route**: `/admin/roles`
- **Permission**: `MANAGE_ROLES`
- Features:
  - List all roles and their current permissions.
  - Toggle individual permissions for each role.
  - Save changes via `PATCH /admin/roles/:roleName/permissions`.

This allows fine-grained control so that reporting roles and admins have the correct capabilities.

---

## 9. Typical Usage Flow

1. **Admin** logs in:

   - Navigates to `/admin/roles` and verifies permissions per role.
   - Navigates to `/admin/categories` to set up standard expense categories.
   - Navigates to `/admin/users` to onboard users and assign appropriate roles & managers.

2. **Employee** logs in:

   - Uses `/expenses/new` to submit reimbursement requests.
   - Monitors `/reports` to see their submitted expenses and statuses.

3. **Manager** logs in:

   - Uses `/reports` for a dashboard of team expenses.
   - Uses `/approvals` to approve or reject requests.

4. **Finance / CA / HR / CEO / CTO**:
   - Uses `/reports` to view expenses as per their viewing permissions.
   - If they have `EXPORT_REPORTS`, they can export grouped reports in CSV.

---

## 10. Troubleshooting

### 10.1. Always redirected to `/login` after refresh

- Ensure `AuthProvider` is wrapping the app (in `main.tsx`).
- Check that `AuthContext` initializes `user` from `localStorage`.
- Confirm that after login, `user` and `accessToken` are actually written to `localStorage`.

### 10.2. API calls failing with 401 / 403

- Confirm `VITE_API_BASE_URL` points to the correct backend.
- Check that your `httpClient` (Axios or fetch wrapper) attaches the `accessToken` from `localStorage` on each request.
- Ensure backend CORS settings allow requests from the frontend origin.

### 10.3. Menu items not visible

- Menu items are shown based on **permissions**, not roles.
- Check the logged-in user’s `permissions` array in Local Storage or via devtools.
- Use `/admin/roles` to assign missing permissions to the user’s role.

---

## 11. Scripts Reference

Common npm scripts (check `package.json` for the exact names):

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint (if configured)
npm run lint

# Tests (if configured)
npm test
```

---

## 12. Notes

- This frontend assumes a compliant backend exposing routes under `/api`.
- All permissions must match the backend’s `PERMISSIONS` enum exactly.
- Notifications (emails) are handled entirely by the backend; the frontend does not send emails directly.

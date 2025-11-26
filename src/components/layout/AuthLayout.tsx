import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem",
          borderRadius: "0.75rem",
          background: "#ffffff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        {/* All auth pages will render here (login, register, forgot pwd, etc.) */}
        <Outlet />
      </div>
    </div>
  );
}

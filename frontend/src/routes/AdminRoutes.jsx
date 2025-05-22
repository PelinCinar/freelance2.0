import React from "react";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";

export const AdminRoutes = [
  {
    path: "/admin-panel",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      // İleride admin için başka sayfalar eklersen buraya ekleyebilirsin
    ],
  },
];

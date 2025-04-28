import React from "react";
import { Route } from "react-router-dom";
import EmployerLayout from "../layouts/EmployerLayout"; // EmployerLayout import et
import EmployerDashboard from "../pages/Employer/EmployerDashboardPage"; 
import Projects from "../pages/Project/Projects"
import CardDetail from "../components/Employer/Card/CardDetail";
export const EmployerRoutes = [
  {
    path: "/employer-panel", // İşveren paneline yönlendirme
    element: <EmployerLayout />,
    children: [
      {
        path: "dashboard",
        element: <EmployerDashboard />,
      },
      {
        path: "projects", 
        element: <Projects />,
      },
      {
        path: "projects/:id", // ✅ 
        element: <CardDetail />,
      },
    ],
  },
];

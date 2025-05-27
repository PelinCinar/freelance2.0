import React from "react";
import { Route } from "react-router-dom";
import EmployerLayout from "../layouts/EmployerLayout"; // EmployerLayout import et
import EmployerDashboard from "../pages/Employer/EmployerDashboardPage";
import Projects from "../pages/Project/Projects";
import CardDetail from "../components/Employer/Card/CardDetail";
import CompletedProjects from "../pages/Employer/CompletedProjects";
import ProjectBids from "../pages/Project/ProjectBids";
import CreateProject from "../pages/Project/CreateProject";
import ReviewedProjects from "../pages/Employer/ReviewedProjects";
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
      {
        path: "completed-projects",
        element: <CompletedProjects />,
      },
      {
        path: "projects/:projectId/bids",
        element: <ProjectBids />,
      },
      {
        path: "projects/create",
        element: <CreateProject />,
      },
      {
        path: "reviewed-projects",
        element: <ReviewedProjects />,
      },
    ],
  },
];

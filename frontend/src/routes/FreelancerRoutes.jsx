import React from "react";
import FreelancerLayout from "../layouts/FreelancerLayout"; // FreelancerLayout import et
import FreelancerDashboardPage from "../pages/Freelancer/FreelancerDashboardPage"; // Freelancer Dashboard sayfası
import FreelancerProjects from "../pages/Project/FreelancerProjects"; // Freelancer projelerini listelemek için
import Profile from "../pages/Profile/Profile";

export const FreelancerRoutes = [
  {
    path: "/freelancer-panel", // Freelancer paneline yönlendirme
    element: <FreelancerLayout />, // FreelancerLayout kullanıyoruz
    children: [
      {
        path: "dashboard", // Freelancer dashboard
        element: <FreelancerDashboardPage />,
      },
      {
        path: "projects", // Freelancer projelerini listelemek
        element: <FreelancerProjects />,
      },
      {
        path: "profile", // Proje detayına yönlendirme
        element: <Profile />, // Proje detay bileşeni
      },
    ],
  },
];

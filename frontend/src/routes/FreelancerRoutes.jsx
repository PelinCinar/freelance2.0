import React from "react";
import FreelancerLayout from "../layouts/FreelancerLayout"; // FreelancerLayout import et
import FreelancerDashboardPage from "../pages/Freelancer/FreelancerDashboardPage"; // Freelancer Dashboard sayfası
import FreelancerProjects from "../pages/Project/FreelancerProjects"; // Freelancer projelerini listelemek için
import Profile from "../pages/Profile/Profile";
import MyBids from "../pages/Freelancer/MyBids"; // Toplam Tekliflerim
import OpenProjects from "../pages/Freelancer/OpenProjects"; // Açık Projeler
import BidStatus from "../pages/Freelancer/BidStatus"; // Teklif Durumları
import ProjectDetail from "../pages/Freelancer/ProjectDetail"; // Proje Detayı

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
        path: "my-bids", // Toplam Tekliflerim
        element: <MyBids />,
      },
      {
        path: "open-projects", // Açık Projeler
        element: <OpenProjects />,
      },
      {
        path: "bid-status", // Teklif Durumları
        element: <BidStatus />,
      },
      {
        path: "projects", // Freelancer projelerini listelemek
        element: <FreelancerProjects />,
      },
      {
        path: "project/:id", // Proje detayı
        element: <ProjectDetail />,
      },
      {
        path: "profile", // Proje detayına yönlendirme
        element: <Profile />, // Proje detay bileşeni
      },
    ],
  },
];

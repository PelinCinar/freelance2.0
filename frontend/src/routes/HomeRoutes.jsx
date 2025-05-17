// src/routes/HomeRoutes.jsx
import React from 'react';
import Home from '../pages/Home/Home'; // Home component import ediliyor
import HomeLayout from '../layouts/HomeLayout';
import Profile from '../pages/Profile/Profile'; 
import PaymentSuccess from '../components/Payment/PaymentSuccess'; 

export const HomeRoutes = {
  path: '/',
  element: <HomeLayout />, // HomeLayout içerisinde tüm sayfalar görünecek
  children: [
    {
      path: '', // Home page (ana sayfa) için rotayı belirliyoruz
      element: <Home />, // Home component
    },
    {
      path: 'profile', // Profile sayfası için rotayı ekliyoruz
      element: <Profile />, // Profile component
    },
    {
      path: "payment-success",
      element: <PaymentSuccess />,
    },
  ],
};

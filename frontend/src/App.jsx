import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomeRoutes } from './routes/HomeRoutes'; 
import { AuthRoutes } from './routes/AuthRoutes'; 
import { EmployerRoutes } from './routes/EmployerRoutes'; 
import { ChatRoutes } from './routes/ChatRoutes';
import { FreelancerRoutes } from './routes/FreelancerRoutes';

const router = createBrowserRouter([
  HomeRoutes,  
  AuthRoutes,  
  ...EmployerRoutes,
  ...FreelancerRoutes,
  ChatRoutes
]);

const App = () => {
  return <RouterProvider router={router} />; // RouterProvider kullanarak router'ı sağlıyoruz
};

export default App;

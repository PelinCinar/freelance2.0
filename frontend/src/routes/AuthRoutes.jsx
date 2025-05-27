// src/routes/AuthRoutes.jsx
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import AuthLayout from '../layouts/AuthLayout';

export const AuthRoutes = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'register',
      element: <Register />,
    },
  ],
};

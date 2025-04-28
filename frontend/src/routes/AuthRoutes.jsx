// src/routes/AuthRoutes.jsx
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

export const AuthRoutes = {
  path: '/',
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

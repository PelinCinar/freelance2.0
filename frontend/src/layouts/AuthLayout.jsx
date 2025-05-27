import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AuthLayout;

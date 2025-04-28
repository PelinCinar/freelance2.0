import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom'; // 🔥 React Router'dan Outlet'i alıyoruz

const HomeLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> {/* 🔥 children yerine burası kullanılmalı */}
      </main>
    </div>
  );
};

export default HomeLayout;

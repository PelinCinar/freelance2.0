import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar.jsx";

const AdminLayout = () => {
  return (
    <div className="flex h-full min-h-screen">
      <AdminSidebar />
      <div className="flex-grow p-6 bg-gray-100 dark:bg-red-300">
        <Outlet /> {/*Admin sayfalarımız buraya gelecek. */}
      </div>
    </div>
  );
};

export default AdminLayout;

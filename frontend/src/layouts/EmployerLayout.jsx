import { Outlet } from "react-router-dom";  // İçerik alanı için Outlet kullanacağız.
import EmployerSidebar from "../components/Employer/EmployerSidebar"

const EmployerLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sabit Sidebar - Artık sidebar kendi içinde fixed */}
      <EmployerSidebar />

      {/* İçerik Alanı */}
      <div className="flex-1 ml-64 overflow-y-auto bg-slate-100 dark:bg-darkPrimary min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployerLayout;

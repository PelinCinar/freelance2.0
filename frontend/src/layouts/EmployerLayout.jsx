import { Outlet } from "react-router-dom";  // İçerik alanı için Outlet kullanacağız.
import EmployerSidebar from "../components/Employer/EmployerSidebar"
const EmployerLayout = () => {
  return (
    <div className="flex h-full">
      <EmployerSidebar /> {/* Sidebar'ı burada ekliyoruz */}
      <div className="flex-grow p-6 bg-slate-100 dark:bg-darkPrimary">
        <Outlet /> {/* Burada içerik alanı değişecek */}
      </div>
    </div>
  );
};

export default EmployerLayout;

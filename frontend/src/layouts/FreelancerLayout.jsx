import { Outlet } from "react-router-dom";
import FreelancerSidebar from "../components/Freelancer/FreelancerSidebar";

const FreelancerLayout = () => {
  return (
    <div className="flex h-full">
      <FreelancerSidebar />
      <div className="flex-grow p-6 bg-slate-100 dark:bg-darkPrimary">
        <Outlet />
      </div>
    </div>
  );
};

export default FreelancerLayout;

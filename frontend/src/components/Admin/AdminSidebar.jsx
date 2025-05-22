import { NavLink } from "react-router-dom";
import { FaUsers, FaProjectDiagram, FaCog } from "react-icons/fa";

const AdminSidebar = () => {
  return (
    <aside className="bg-white p-5 border-r flex flex-col gap-y-2 lg:w-64 w-24 h-screen">
      <div className="text-black font-bold pb-1 border-b text-center lg:text-2xl text-sm bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600">
        <span className="lg:flex hidden">Admin Paneli</span>
        <span className="lg:hidden flex">Admin</span>
      </div>

      <div className="flex flex-col justify-between items-start h-full">
        <nav className="flex flex-col gap-y-4 mt-3 w-full">
          <NavLink
            to="/admin-panel/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-red-100 text-red-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaUsers size={20} />
            <span className="lg:flex hidden">Kullanıcılar</span>
            <span className="lg:hidden flex">K</span>
          </NavLink>

          <NavLink
            to="/admin-panel/projects"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-red-100 text-red-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaProjectDiagram size={20} />
            <span className="lg:flex hidden">Projeler</span>
            <span className="lg:hidden flex">P</span>
          </NavLink>

          <NavLink
            to="/admin-panel/settings"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-red-100 text-red-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaCog size={20} />
            <span className="lg:flex hidden">Ayarlar</span>
            <span className="lg:hidden flex">A</span>
          </NavLink>
        </nav>

        <NavLink
          to="/"
          className="bg-zinc-50 rounded-full px-4 py-2 border w-full flex justify-center items-center text-sm hover:bg-zinc-100"
        >
          Anasayfa
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;

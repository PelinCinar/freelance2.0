import { NavLink } from "react-router-dom";
import { FaLayerGroup } from "react-icons/fa";

const EmployerSidebar = () => {
  return (
    <aside className="bg-white p-5 border-r flex flex-col gap-y-2 lg:w-64 w-24 h-screen">
      <div className="text-black font-bold pb-1 border-b text-center lg:text-2xl text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
        <span className="lg:flex hidden">İşveren Paneli</span>
        <span className="lg:hidden flex">PaneL</span>
      </div>

      <div className="flex flex-col justify-between items-start h-full">
        <nav className="flex flex-col gap-y-4 mt-3 w-full">
          <NavLink
            to="/employer-panel/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaLayerGroup size={20} />
            <span className="lg:flex hidden">Dashboard</span>
          </NavLink>
          <NavLink
            to="/employer-panel/projects"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaLayerGroup size={20} />
            <span className="lg:flex hidden">Proje Görüntüle</span>
            <span className="lg:hidden flex">PG</span>
          </NavLink>

          {/* İstersen buraya daha fazla nav ekleyebilirsin */}
          {/* Örnek: İlanlar, Başvurular, Profil Ayarları vs. */}
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

export default EmployerSidebar;

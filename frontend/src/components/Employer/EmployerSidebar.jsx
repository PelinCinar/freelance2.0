import { NavLink } from "react-router-dom";
import { FaLayerGroup, FaCheckCircle, FaStar } from "react-icons/fa";

const EmployerSidebar = () => {
  return (
    <aside className="bg-white p-5 border-r flex flex-col gap-y-2 w-64 h-screen fixed left-0 top-0 z-20 shadow-lg">
      <div className="text-black font-bold pb-1 border-b text-center text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
        İşveren Paneli
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
            <span>Dashboard</span>
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
            <span>Projelerim</span>
          </NavLink>

          <NavLink
            to="/employer-panel/completed-projects"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-green-100 text-green-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaCheckCircle size={20} />
            <span>Tamamlanan Projeler</span>
          </NavLink>

          <NavLink
            to="/employer-panel/reviewed-projects"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-yellow-100 text-yellow-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaStar size={20} />
            <span>Yorumladığım Projeler</span>
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

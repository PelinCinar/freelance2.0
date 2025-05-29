import { NavLink } from "react-router-dom";
import {
  FaLayerGroup,
  FaUserAlt,
  FaProjectDiagram,
  FaPaperPlane,
  FaFolderOpen,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const FreelancerSidebar = () => {
  return (
    <aside className="bg-white p-5 border-r flex flex-col gap-y-2 lg:w-64 w-24 h-screen">
      <div className="text-black font-bold pb-1 border-b text-center lg:text-2xl text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
        <span className="lg:flex hidden">Freelancer Paneli</span>
        <span className="lg:hidden flex">Freelancer</span>
      </div>

      <div className="flex flex-col justify-between items-start h-full">
        <nav className="flex flex-col gap-y-4 mt-3 w-full">
          <NavLink
            to="/freelancer-panel/dashboard"
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
            <span className="lg:hidden flex">D</span>
          </NavLink>

          <NavLink
            to="/freelancer-panel/my-bids"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-green-100 text-green-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaPaperPlane size={20} />
            <span className="lg:flex hidden">Toplam Tekliflerim</span>
            <span className="lg:hidden flex">T</span>
          </NavLink>

          <NavLink
            to="/freelancer-panel/open-projects"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-purple-100 text-purple-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaFolderOpen size={20} />
            <span className="lg:flex hidden">Açık Projeler</span>
            <span className="lg:hidden flex">A</span>
          </NavLink>

          <NavLink
            to="/freelancer-panel/bid-status"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-orange-100 text-orange-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaClock size={20} />
            <span className="lg:flex hidden">Teklif Durumları</span>
            <span className="lg:hidden flex">D</span>
          </NavLink>

          <NavLink
            to="/freelancer-panel/projects"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaProjectDiagram size={20} />
            <span className="lg:flex hidden">Projelerim</span>
            <span className="lg:hidden flex">P</span>
          </NavLink>

          <NavLink
            to="/freelancer-panel/profile"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border flex items-center gap-x-2 transition-all
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`
            }
          >
            <FaUserAlt size={20} />
            <span className="lg:flex hidden">Profil</span>
            <span className="lg:hidden flex">P</span>
          </NavLink>

          {/* Diğer seçenekler de eklenebilir: Başvurular, Bildirimler vb. */}
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

export default FreelancerSidebar;

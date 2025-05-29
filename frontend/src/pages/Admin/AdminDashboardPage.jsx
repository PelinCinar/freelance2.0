import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../utils/api";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ADMIN_DASHBOARD, {
          method: "GET",
          credentials: "include", // Eğer httpOnly cookie ile token gönderiyorsan bunu eklemelisin
        });

        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          console.error("Hata:", data.message);
        }
      } catch (error) {
        console.error("Veri alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (!stats) return <div>Veri bulunamadı.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} />
      <StatCard title="Freelancer Sayısı" value={stats.totalFreelancers} />
      <StatCard title="Employer Sayısı" value={stats.totalEmployers} />
      <StatCard title="Toplam Proje" value={stats.totalProjects} />
      <StatCard title="Açık Projeler" value={stats.openProjects} />
      <StatCard title="Devam Eden Projeler" value={stats.inProgressProjects} />
      <StatCard title="Tamamlanan Projeler" value={stats.completedProjects} />
      <StatCard title="Toplam Teklif" value={stats.totalBids} />
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white dark:bg-slate-200 p-14 rounded-xl shadow-md border text-center">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
  </div>
);

export default AdminDashboardPage;

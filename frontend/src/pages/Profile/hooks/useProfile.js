import { useState, useEffect } from "react";
import { message } from "antd";

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedJobs: 0,
    totalProjects: 0,
    averageRating: 0,
    completionRate: 75
  });

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        // Employer için proje istatistiklerini çek
        let completedJobsCount = 0;
        let totalProjectsCount = 0;

        if (data.user.role === 'employer') {
          try {
            // Tamamlanan projeler
            const completedRes = await fetch("http://localhost:8080/api/projects/completed", {
              method: "GET",
              credentials: "include",
            });
            if (completedRes.ok) {
              const completedData = await completedRes.json();
              completedJobsCount = completedData.count || 0;
            }

            // Toplam projeler
            const totalRes = await fetch("http://localhost:8080/api/projects/my-projects", {
              method: "GET",
              credentials: "include",
            });
            if (totalRes.ok) {
              const totalData = await totalRes.json();
              totalProjectsCount = totalData.data?.length || 0;
            }
          } catch (err) {
            console.error("Proje istatistikleri alınamadı:", err);
            completedJobsCount = 0;
            totalProjectsCount = 0;
          }
        } else {
          // Freelancer için şimdilik sabit değer, sonra freelancer API'si eklenecek
          completedJobsCount = 3;
          totalProjectsCount = data.user.portfolio?.length || 0; // Freelancer için portfolio sayısı
        }

        // Dinamik stats hesapla
        const userStats = {
          completedJobs: completedJobsCount,
          totalProjects: totalProjectsCount,
          averageRating: data.user.rating?.average || 0, // Dinamik rating
          completionRate: data.user.role === 'employer'
            ? Math.min(100, Math.round((totalProjectsCount / 10) * 100)) // Employer için proje sayısına göre
            : Math.min(100, (data.user.portfolio?.length || 0) * 25) // Freelancer için portfolio sayısına göre
        };
        setStats(userStats);
      } else {
        message.error("Kullanıcı bilgisi alınamadı.");
      }
    } catch (err) {
      console.error(err);
      message.error("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);

    // Stats'ı da güncelle - tamamlanan işler ve toplam projeler için mevcut değeri koru
    const userStats = {
      completedJobs: stats.completedJobs, // Mevcut değeri koru
      totalProjects: stats.totalProjects, // Mevcut değeri koru (API'den geldiği için)
      averageRating: newUserData.rating?.average || 0, // Dinamik rating
      completionRate: newUserData.role === 'employer'
        ? Math.min(100, Math.round((stats.totalProjects / 10) * 100)) // Employer için proje sayısına göre
        : Math.min(100, (newUserData.portfolio?.length || 0) * 25) // Freelancer için portfolio sayısına göre
    };
    setStats(userStats);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    stats,
    fetchUser,
    updateUser
  };
};

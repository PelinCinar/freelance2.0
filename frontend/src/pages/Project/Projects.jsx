import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/projects/", {
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          setProjects(data.data); 
        } else {
          console.error("Projeler alınamadı:", data.message);
        }
      } catch (error) {
        console.error("Projeleri çekerken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Projelerim</h1>

      {projects.length === 0 ? (
        <p>Henüz bir projeniz bulunmamaktadır.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project._id}
            className="border p-4 rounded shadow space-y-2"
          >
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p>{project.description}</p>
            <p>
              <strong>Bütçe:</strong> ${project.budget}
            </p>
            <p>
              <strong>Durum:</strong> {project.status}
            </p>
            <p>
              <strong>Teklif Sayısı:</strong> {project.bids.length}
            </p>

            <Link
              to={`/employer-panel/projects/${project._id}`}
              className="text-blue-600 hover:underline"
            >
              Detayları Gör
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Projects;

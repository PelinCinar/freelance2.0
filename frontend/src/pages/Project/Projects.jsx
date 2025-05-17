import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Typography, Spin, Badge } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingProjectId, setPayingProjectId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/projects/my-projects",
          {
            credentials: "include",
          }
        );

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

  const handlePayment = async (projectId) => {
    setPayingProjectId(projectId);
    try {
      const res = await fetch(
        "http://localhost:8080/api/payments/checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ projectId }),
        }
      );

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Ödeme URL'si alınamadı:", data.message);
      }
    } catch (error) {
      console.error("Ödeme başlatılırken hata:", error);
    } finally {
      setPayingProjectId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <Spin size="large" tip="Projeler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-4">
        Projelerim
      </Title>

      {projects.length === 0 ? (
        <Paragraph>Henüz bir projeniz bulunmamaktadır.</Paragraph>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project._id}
              title={project.title}
              className="relative" // Konumlandırma için relative yapıyoruz
            >
              {project.paymentStatus === "completed" && (
                <Badge
                  status="success"
                  text="Ödendi"
                  style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }} // Sağ üst köşeye konumlandırıyoruz
                />
              )}
              <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                {project.description}
              </Paragraph>
              <Paragraph>
                <strong>Bütçe:</strong> ${project.budget}
              </Paragraph>
              <Paragraph>
                <strong>Durum:</strong> {project.status}
              </Paragraph>
              <Paragraph>
                <strong>Teklif Sayısı:</strong> {project.bids.length}
              </Paragraph>

              <div className="flex justify-between items-center mt-4">
                {project.isApproved ? (
                  <Button
                    type="primary"
                    onClick={() => handlePayment(project._id)}
                    loading={payingProjectId === project._id}
                    disabled={project.paymentStatus === "completed"}
                    icon={project.paymentStatus === "completed" ? <CheckCircleOutlined /> : null}
                  >
                    {project.paymentStatus === "completed"
                      ? "Ödeme Tamamlandı"
                      : payingProjectId === project._id
                      ? "Yönlendiriliyor..."
                      : "Ödeme Yap"}
                  </Button>
                ) : (
                  <Paragraph className="text-gray-500">Proje henüz onaylanmadı.</Paragraph>
                )}
                <Link
                  to={`/employer-panel/projects/${project._id}`}
                  className="text-blue-600 hover:underline"
                  style={{ position: "absolute", bottom: 10, right: 10 }} // Sağ alt köşeye konumlandırıyoruz
                >
                  Detaylar
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
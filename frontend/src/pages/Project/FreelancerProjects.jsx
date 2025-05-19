import React, { useState, useEffect } from "react";
import { Button,  Card, Badge, Skeleton, Typography, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import FreelancerProjectsModal from "../../components/Modals/FreelancerProjectsModal";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const FreelancerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:8080/api/bids/open-projects-with-bids",
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
        console.error("Veri çekerken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getDurumEtiketi = (bid) => {
    if (bid.status === "accepted" && bid.project.status === "completed") {
      return (
        <Badge
          status="success"
          text="Tamamlandı"
          icon={<CheckCircleOutlined />}
        />
      );
    }
    if (bid.status === "accepted") {
      return (
        <Badge
          status="processing"
          text="İlerleme Aşamasında"
          icon={<ClockCircleOutlined />}
        />
      );
    }
    return <Badge status="default" text="Teklif Verildi" />;
  };

  const getCardStyle = (bid) => {
    if (bid.status === "accepted" && bid.project.status === "completed") {
      return { backgroundColor: "#d4edda", color: "#155724" };
    }
    if (bid.status === "accepted") {
      return { backgroundColor: "#fff3cd", color: "#856404" };
    }
    return { backgroundColor: "#f8d7da", color: "#721c24" };
  };

  const startChat = (projectId) => {
    navigate(`/chat/${projectId}`);
  };

  const showUpdateModal = (bid) => {
    setSelectedBid(bid);
    setIsModalVisible(true);
  };

  const handleModalOk = (updatedAmount, updatedMessage) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project._id === selectedBid._id
          ? { ...project, amount: updatedAmount, message: updatedMessage }
          : project
      )
    );
    setIsModalVisible(false);
  };

  if (loading) return <Skeleton active />;

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter((bid) =>
          activeTab === "pending"
            ? bid.status === "pending"
            : activeTab === "active"
            ? bid.status === "accepted" && bid.project.status !== "completed"
            : bid.project.status === "completed"
        );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2}>Statusu open olan tüm projeler ve benim teklif verdiklerim cart curt</Title>

      <Tabs
        defaultActiveKey="all"
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      >
        <Tabs.TabPane tab="Tümü" key="all" />
        <Tabs.TabPane tab="Bekleyen" key="pending" />
        <Tabs.TabPane tab="Aktif" key="active" />
        <Tabs.TabPane tab="Tamamlanan" key="completed" />
      </Tabs>

      {filteredProjects.length === 0 ? (
        <Text type="secondary">Henüz açık proje bulunmamaktadır.</Text>
      ) : (
        filteredProjects.map((bid) => (
          <Card
            key={bid._id}
            title={<Title level={4}>{bid.project.title}</Title>}
            extra={getDurumEtiketi(bid)}
            style={{
              marginBottom: "20px",
              hoverable: true,
              ...getCardStyle(bid),
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <Text strong style={{ display: "block", marginBottom: "4px" }}>
                Proje Açıklaması:
              </Text>
              <Text>{bid.project.description}</Text>

              <div style={{ marginTop: "0.5rem" }}>
                <Text strong>Proje Bütçesi:</Text> <Text>${bid.project.budget}</Text>
              </div>
            </div>

            <div
              style={{
                marginBottom: "1rem",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "1rem",
              }}
            >
              <Text strong style={{ display: "block", marginBottom: "4px" }}>
                Verdiğiniz Teklif:
              </Text>
              <div>
                <Text strong>Tutar:</Text> <Text>${bid.amount}</Text>
              </div>
              <div>
                <Text strong>Mesaj:</Text> <Text>{bid.message}</Text>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <Button
                type="primary"
                onClick={() => startChat(bid.project._id)}
                disabled={
                  !(
                    bid.status === "accepted" &&
                    (bid.project.status === "in-progress" ||
                      bid.project.status === "completed")
                  )
                }
              >
                Sohbete Başla
              </Button>
            </div>

            {!(bid.status === "accepted") && (
              <Text style={{ color: "gray", display: "block", marginTop: "8px" }}>
                Teklifiniz henüz kabul edilmediği için sohbet başlatamazsınız.
              </Text>
            )}
            {bid.status === "accepted" && bid.project.status === "open" && (
              <Text style={{ color: "gray", display: "block", marginTop: "8px" }}>
                Proje henüz başlamadı. Sohbet aktif değil.
              </Text>
            )}

            {bid.status === "pending" ? (
              <Button
                type="dashed"
                onClick={() => showUpdateModal(bid)}
                style={{ marginTop: "10px" }}
              >
                Teklifimi Güncelle
              </Button>
            ) : (
              <p style={{ color: "gray", marginTop: "10px" }}>
                Bu aşamada teklif güncellenemez.
              </p>
            )}
          </Card>
        ))
      )}

      {selectedBid && (
        <FreelancerProjectsModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleModalOk}
          bid={selectedBid}
        />
      )}
    </div>
  );
};

export default FreelancerProjects;
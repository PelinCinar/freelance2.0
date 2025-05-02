import React, { useState, useEffect } from "react";
import { Button, message, Card, Badge, Skeleton, Typography } from "antd";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import FreelancerProjectsModal from "../../components/Modals/FreelancerProjectsModal"; // Modal'ı import ediyoruz
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// Socket.io'yu başlatıyoruz
const socket = io("http://localhost:8080");

const { Title, Text } = Typography;

const FreelancerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
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

  const startChat = (projectId, acceptedBidId) => {
    socket.emit("joinRoom", acceptedBidId);
    message.success("Sohbet odasına katıldınız.");
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

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2}>Açık Projeler</Title>
      {projects.length === 0 ? (
        <Text type="secondary">Henüz açık proje bulunmamaktadır.</Text>
      ) : (
        projects.map((bid) => (
          <Card
  key={bid._id}
  title={<Title level={4}>{bid.project.title}</Title>}
  extra={getDurumEtiketi(bid)}
  style={{ marginBottom: "20px" }}
  hoverable
>
  {/* Proje Bilgisi */}
  <div style={{ marginBottom: "1rem" }}>
    <Text strong style={{ display: "block", marginBottom: "4px" }}>
      Proje Açıklaması:
    </Text>
    <Text>{bid.project.description}</Text>

    <div style={{ marginTop: "0.5rem" }}>
      <Text strong>Proje Bütçesi:</Text>{" "}
      <Text>${bid.project.budget}</Text>
    </div>
  </div>

  {/* Freelancer'ın Teklifi */}
  <div style={{ marginBottom: "1rem", borderTop: "1px solid #f0f0f0", paddingTop: "1rem" }}>
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

  {/* Aksiyonlar */}
  <div style={{ marginTop: "12px" }}>
    <Button
      type="primary"
      onClick={() => startChat(bid.project._id, bid._id)}
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

  {/* Bilgilendirme ve Teklif Güncelleme */}
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

  {/* Teklif Güncelle Butonu */}
  {bid.status === "pending" ? (
    <Button type="dashed" onClick={() => showUpdateModal(bid)} style={{ marginTop: "10px" }}>
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

      {/* Teklif Güncelle Modal */}
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

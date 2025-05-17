import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, message, Typography, Divider, List, Tag, Rate } from "antd";
import { FileOutlined, CalendarOutlined, MessageOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const CardDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setProject(data.data);
        } else {
          message.error("Proje detayları alınamadı.");
        }
      } catch (error) {
        console.error("Proje detayı alınırken hata oluştu:", error);
        message.error("Proje detayları alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>Yükleniyor...</div>;
  if (!project) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>Proje bulunamadı.</div>;

  const startChat = () => {
    if (project.acceptedBid) {
      navigate(`/chat/${project._id}`);
    } else {
      message.error("Kabul edilen teklif bulunamadı.");
    }
  };

  return (
    <div className="p-6" style={{ display: "flex", justifyContent: "center" }}>
      <Card
        title={<Title level={3}>{project.title}</Title>}
        style={{ width: "100%", maxWidth: 800 }}
      >
        <Paragraph>{project.description}</Paragraph>
        <Divider />
        <div className="mb-3">
          <Tag color="geekblue">Bütçe: ${project.budget}</Tag>
          <Tag color={project.status === "active" ? "green" : "default"}>Durum: {project.status}</Tag>
          <Tag color="cyan">Teklif Sayısı: {project.bids.length}</Tag>
        </div>
        <Paragraph>
          <strong>Kabul Edilen Teklif:</strong>{" "}
          {project.acceptedBid ? project.acceptedBid._id : <Tag color="warning">Henüz Yok</Tag>}
        </Paragraph>
        <Divider dashed />
        <div className="mb-3">
          <Typography.Text strong>Gönderilen Dosyalar:</Typography.Text>
          <List
            size="small"
            dataSource={project.projectSubmissions}
            renderItem={(file) => (
              <List.Item>
                <FileOutlined className="mr-2" />
                <a
                  href={`http://localhost:8080${file.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-blue-500 underline"
                >
                  {file.fileName}
                </a>{" "}
                <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                  <CalendarOutlined className="mr-1" />
                  {new Date(file.uploadedAt).toLocaleString()}
                </Typography.Text>
              </List.Item>
            )}
          />
        </div>
        <Divider dashed />
        <Paragraph>
          <strong>Ortalama Puan:</strong>{" "}
          {project.rating.average ? <Rate disabled defaultValue={project.rating.average} /> : "Henüz yok"}
        </Paragraph>
        <Paragraph>
          <CalendarOutlined className="mr-1" />
          <strong>Oluşturulma Tarihi:</strong> {new Date(project.createdAt).toLocaleString()}
        </Paragraph>
        <div style={{ textAlign: "right", marginTop: 24 }}>
          {project.acceptedBid ? (
            <Button type="primary" onClick={startChat} icon={<MessageOutlined />}>
              Sohbete Başla
            </Button>
          ) : (
            <Button type="default" disabled icon={<MessageOutlined />}>
              Sohbete Başla
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CardDetail;
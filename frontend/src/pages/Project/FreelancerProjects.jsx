import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Badge,
  Skeleton,
  Typography,
  Tabs,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Empty,
  Spin,
  message
} from "antd";
import { useNavigate } from "react-router-dom";
import FreelancerProjectsModal from "../../components/Modals/FreelancerProjectsModal";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ProjectOutlined,
  MessageOutlined,
  EditOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const FreelancerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    totalEarnings: 0
  });
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

          // İstatistikleri hesapla
          const projectStats = {
            total: data.data.length,
            pending: data.data.filter(bid => bid.status === "pending").length,
            active: data.data.filter(bid => bid.status === "accepted" && bid.project.status !== "completed").length,
            completed: data.data.filter(bid => bid.project.status === "completed").length,
            totalEarnings: data.data
              .filter(bid => bid.project.status === "completed")
              .reduce((sum, bid) => sum + (bid.amount || 0), 0)
          };
          setStats(projectStats);
        } else {
          console.error("Projeler alınamadı:", data.message);
          message.error("Projeler yüklenirken bir hata oluştu.");
        }
      } catch (error) {
        console.error("Veri çekerken bir hata oluştu:", error);
        message.error("Sunucuya ulaşılamadı.");
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

  const handleEditBid = (bid) => {
    setSelectedBid(bid);
    setIsModalVisible(true);
  };

  const handleSubmitBid = (updatedAmount, updatedMessage) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project._id === selectedBid._id
          ? { ...project, amount: updatedAmount, message: updatedMessage }
          : project
      )
    );
    setIsModalVisible(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Projeler yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

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
    <div className="p-6 space-y-6">
      {/* Başlık */}
      <div className="mb-6">
        <Title level={2} className="mb-2">Freelancer Projelerim</Title>
        <Text type="secondary">Teklif verdiğiniz ve üzerinde çalıştığınız projeler</Text>
      </div>

      {/* İstatistikler */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Toplam Proje"
              value={stats.total}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Bekleyen Teklif"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Aktif Proje"
              value={stats.active}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Toplam Kazanç"
              value={stats.totalEarnings}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="shadow-sm">
        <Tabs
          defaultActiveKey="all"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: (
                <Space>
                  <ProjectOutlined />
                  <span>Tümü</span>
                  <Badge count={stats.total} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              )
            },
            {
              key: "pending",
              label: (
                <Space>
                  <ClockCircleOutlined />
                  <span>Bekleyen</span>
                  <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} />
                </Space>
              )
            },
            {
              key: "active",
              label: (
                <Space>
                  <TeamOutlined />
                  <span>Aktif</span>
                  <Badge count={stats.active} style={{ backgroundColor: '#722ed1' }} />
                </Space>
              )
            },
            {
              key: "completed",
              label: (
                <Space>
                  <CheckCircleOutlined />
                  <span>Tamamlanan</span>
                  <Badge count={stats.completed} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              )
            }
          ]}
        />
      </Card>

      {/* Projeler */}
      <Card
        title={
          <Space>
            <ProjectOutlined />
            <span>Projeler ({filteredProjects.length})</span>
          </Space>
        }
        className="shadow-lg"
      >
        {filteredProjects.length === 0 ? (
          <Empty
            description="Bu kategoride proje bulunmamaktadır."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredProjects.map((bid) => (
              <Col xs={24} sm={12} lg={8} key={bid._id}>
                <Card
                  className="hover:shadow-lg transition-all duration-300 h-full"
                  actions={[
                    bid.status === "accepted" ? (
                      <Button
                        key="chat"
                        type="primary"
                        icon={<MessageOutlined />}
                        onClick={() => navigate(`/chat/${bid.project._id}`)}
                      >
                        Sohbet Et
                      </Button>
                    ) : bid.status === "pending" ? (
                      <Button
                        key="edit"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditBid(bid)}
                      >
                        Düzenle
                      </Button>
                    ) : (
                      <Button
                        key="rejected"
                        type="link"
                        disabled
                        icon={<CloseCircleOutlined />}
                      >
                        Reddedildi
                      </Button>
                    )
                  ]}
                >
                  <div className="space-y-3">
                    {/* Başlık ve Durum */}
                    <div className="flex justify-between items-start">
                      <Title level={5} className="mb-0 flex-1 mr-2">
                        {bid.project.title}
                      </Title>
                      {getDurumEtiketi(bid)}
                    </div>

                    {/* Açıklama */}
                    <Text type="secondary" className="block">
                      {bid.project.description.length > 100
                        ? `${bid.project.description.substring(0, 100)}...`
                        : bid.project.description}
                    </Text>

                    {/* Proje Bilgileri */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text strong>Proje Bütçesi:</Text>
                        <Text className="text-blue-600 font-semibold">
                          {bid.project.budget}₺
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text strong>Benim Teklifim:</Text>
                        <Text className="text-green-600 font-semibold">
                          {bid.amount}₺
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text strong>Teklif Tarihi:</Text>
                        <Text type="secondary">
                          {new Date(bid.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </div>
                    </div>

                    {/* Teklif Mesajı */}
                    {bid.message && (
                      <div className="pt-2 border-t border-gray-100">
                        <Text type="secondary" className="text-xs block mb-1">
                          Teklif Mesajım:
                        </Text>
                        <Text className="text-sm">
                          {bid.message.length > 80
                            ? `${bid.message.substring(0, 80)}...`
                            : bid.message}
                        </Text>
                      </div>
                    )}

                    {/* Durum Göstergesi */}
                    <div className="pt-2">
                      {bid.status === "accepted" && bid.project.status !== "completed" && (
                        <Tag color="processing" icon={<TeamOutlined />}>
                          Aktif Çalışıyor
                        </Tag>
                      )}
                      {bid.status === "pending" && (
                        <Tag color="warning" icon={<ClockCircleOutlined />}>
                          Cevap Bekleniyor
                        </Tag>
                      )}
                      {bid.project.status === "completed" && (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Proje Tamamlandı
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <FreelancerProjectsModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmitBid}
        bid={selectedBid}
      />
    </div>
  );
};

export default FreelancerProjects;
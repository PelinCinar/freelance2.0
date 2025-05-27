import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  List,
  Avatar,
  Tag,
  Space,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  message,
  Modal,
  Tooltip
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  DollarOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ProjectBids = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectInfo, setProjectInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);



  // Teklifleri ve proje bilgilerini çek
  const fetchBids = async () => {
    setLoading(true);
    try {
      // Teklifleri çek
      const bidsRes = await fetch(`http://localhost:8080/api/bids/project/${projectId}`, {
        credentials: "include",
      });

      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();

        setBids(bidsData.data || []);
      } else {
        const errorData = await bidsRes.json();
        console.error("Bids API Error:", errorData); // Debug log
        message.error(errorData.message || "Teklifler alınamadı.");
      }

      // Proje bilgilerini çek
      const projectRes = await fetch(`http://localhost:8080/api/projects/${projectId}`, {
        credentials: "include",
      });

      if (projectRes.ok) {
        const projectData = await projectRes.json();

        setProjectInfo(projectData.data);
      } else {
        const errorData = await projectRes.json();
        console.error("Project API Error:", errorData); // Debug log
      }

    } catch (error) {
      console.error("API hatası:", error);
      message.error("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchBids();
    }
  }, [projectId]);

  // Teklif kabul et
  const handleAcceptBid = async (bidId) => {
    const confirmed = window.confirm(
      "Bu teklifi kabul etmek istediğinizden emin misiniz?\n\n" +
      "⚠️ UYARI: Bu işlem geri alınamaz ve diğer tüm teklifler otomatik olarak reddedilecektir!"
    );

    if (confirmed) {
      setActionLoading(bidId);
      try {
        const res = await fetch(`http://localhost:8080/api/bids/${bidId}/accept`, {
          method: 'PUT',
          credentials: "include",
        });

        if (res.ok) {
          message.success("🎉 Teklif başarıyla kabul edildi! Diğer teklifler otomatik reddedildi.");
          fetchBids(); // Teklifleri yeniden yükle
        } else {
          const errorData = await res.json();
          message.error(errorData.message || "Teklif kabul edilirken bir hata oluştu.");
        }
      } catch (error) {
        console.error("Teklif kabul hatası:", error);
        message.error("Sunucuya ulaşılamadı.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Teklif reddet
  const handleRejectBid = async (bidId) => {
    const confirmed = window.confirm("Bu teklifi reddetmek istediğinizden emin misiniz?");

    if (confirmed) {
      setActionLoading(bidId);
      try {
        const res = await fetch(`http://localhost:8080/api/bids/${bidId}/reject`, {
          method: 'PUT',
          credentials: "include",
        });

        if (res.ok) {
          message.success("Teklif reddedildi.");
          fetchBids(); // Teklifleri yeniden yükle
        } else {
          const errorData = await res.json();
          message.error(errorData.message || "Teklif reddedilirken bir hata oluştu.");
        }
      } catch (error) {
        console.error("Teklif reddet hatası:", error);
        message.error("Sunucuya ulaşılamadı.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleGoBack = () => {
    navigate(`/employer-panel/projects/${projectId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': return 'Reddedildi';
      case 'pending': return 'Beklemede';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Teklifler yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Başlık ve Geri Dön */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          size="large"
        >
          Proje Detayına Dön
        </Button>
      </div>

      {/* Proje Bilgileri */}
      {projectInfo && (
        <Card className="shadow-lg">
          <div className="flex items-center space-x-4">
            <Avatar
              size={64}
              icon={<TeamOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div className="flex-1">
              <Title level={3} className="mb-1">{projectInfo.title}</Title>
              <Text type="secondary" className="text-lg">
                {projectInfo.description}
              </Text>
              <div className="mt-2">
                <Tag color="blue">Bütçe: {projectInfo.budget}₺</Tag>
                <Tag color="green">Teklif Sayısı: {bids.length}</Tag>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* İstatistikler */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Toplam Teklif"
              value={bids.length}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Bekleyen Teklif"
              value={bids.filter(bid => bid.status === 'pending').length}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Ortalama Teklif"
              value={bids.length > 0 ? Math.round(bids.reduce((sum, bid) => sum + bid.amount, 0) / bids.length) : 0}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Teklifler Listesi */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Gelen Teklifler ({bids.length})</span>
          </Space>
        }
        className="shadow-lg"
      >
        {bids.length === 0 ? (
          <Empty
            description="Bu proje için henüz teklif verilmemiş."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={bids}
            renderItem={(bid) => {
              // Projede kabul edilmiş bir teklif var mı kontrol et
              const hasAcceptedBid = bids.some(b => b.status === 'accepted');
              const isThisBidAccepted = bid.status === 'accepted';



              return (
              <List.Item
                className="hover:bg-gray-50 transition-colors rounded-lg p-4"
                actions={[
                  (() => {
                    if (bid.status === 'pending' && !hasAcceptedBid) {
                      return (
                        <Space key="actions">
                          <Tooltip title="Teklifi kabul et">
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              loading={actionLoading === bid._id}
                              onClick={() => handleAcceptBid(bid._id)}
                            >
                              Kabul Et
                            </Button>
                          </Tooltip>
                          <Tooltip title="Teklifi reddet">
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              loading={actionLoading === bid._id}
                              onClick={() => handleRejectBid(bid._id)}
                            >
                              Reddet
                            </Button>
                          </Tooltip>
                        </Space>
                      );
                    } else if (bid.status === 'pending' && hasAcceptedBid) {
                      return (
                        <Space key="disabled-actions">
                          <Tooltip title="Bu projede zaten bir teklif kabul edilmiştir">
                            <Button disabled icon={<CloseCircleOutlined />}>
                              Otomatik Reddedilecek
                            </Button>
                          </Tooltip>
                        </Space>
                      );
                    } else if (bid.status === 'accepted') {
                      return (
                        <Space key="accepted-actions">
                          <Tag
                            color="success"
                            icon={<CheckCircleOutlined />}
                            className="text-lg px-3 py-1"
                          >
                            ✅ Kabul Edildi
                          </Tag>
                          <Tooltip title="Freelancer ile sohbet et">
                            <Button
                              type="primary"
                              icon={<MessageOutlined />}
                              size="large"
                              onClick={() => navigate(`/chat/${projectId}`)}
                            >
                              💬 Sohbet Et
                            </Button>
                          </Tooltip>
                        </Space>
                      );
                    } else {
                      return (
                        <Tag
                          key="status"
                          color="error"
                          icon={<CloseCircleOutlined />}
                        >
                          ❌ Reddedildi
                        </Tag>
                      );
                    }
                  })()
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#52c41a' }}
                    >
                      {bid.freelancer?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space direction="vertical" size={2}>
                      <Text strong className="text-lg">{bid.freelancer?.name || 'Bilinmiyor'}</Text>
                      <Text type="secondary">{bid.freelancer?.email}</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={8} className="w-full">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Text strong>Teklif Tutarı:</Text>
                          <Text className="text-green-600 font-semibold text-lg">
                            {bid.amount}₺
                          </Text>
                        </div>
                        <div className="flex justify-between">
                          <Text strong>Teklif Tarihi:</Text>
                          <Text type="secondary">
                            {new Date(bid.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </div>
                      </div>

                      {bid.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <Text strong className="block mb-1">Freelancer Mesajı:</Text>
                          <Text>{bid.message}</Text>
                        </div>
                      )}
                    </Space>
                  }
                />
              </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ProjectBids;

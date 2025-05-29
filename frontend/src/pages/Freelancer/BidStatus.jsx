import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Avatar,
  Button,
  Spin,
  Empty,
  Tabs,
  List,
  Progress,
  Statistic,
  Badge,
  Tooltip
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
  MessageOutlined,
  TrophyOutlined,
  SendOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const BidStatus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    successRate: 0
  });

  // Teklifleri getir
  const fetchMyBids = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bids/my-bids", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBids(data.data);

        // İstatistikleri hesapla
        const total = data.data.length;
        const pending = data.data.filter(bid => bid.status === "pending").length;
        const accepted = data.data.filter(bid => bid.status === "accepted").length;
        const rejected = data.data.filter(bid => bid.status === "rejected").length;
        const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

        setStats({
          total,
          pending,
          accepted,
          rejected,
          successRate
        });
      }
    } catch (error) {
      console.error("Teklifler alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, []);

  // Durum rengi
  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      accepted: "green",
      rejected: "red"
    };
    return colors[status] || "default";
  };

  // Durum ikonu
  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      accepted: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  // Durum metni
  const getStatusText = (status) => {
    const texts = {
      pending: "Bekliyor",
      accepted: "Kabul Edildi",
      rejected: "Reddedildi"
    };
    return texts[status] || "Bilinmiyor";
  };

  // Duruma göre teklifleri filtrele
  const getBidsByStatus = (status) => {
    return bids.filter(bid => bid.status === status);
  };

  // Teklif kartı render et
  const renderBidCard = (bid) => (
    <List.Item
      key={bid._id}
      className="hover:bg-gray-50 transition-colors rounded-lg p-4"
      actions={[
        <Tooltip title="Proje Detayı">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/freelancer-panel/project/${bid.project?._id}`)}
          />
        </Tooltip>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={48}
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                bid.status === 'accepted' ? '#52c41a' :
                bid.status === 'pending' ? '#faad14' : '#ff4d4f'
            }}
          >
            {bid.project?.title?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Space direction="vertical" size={2}>
            <Text strong className="text-lg">{bid.project?.title || 'Proje Bilgisi Yok'}</Text>
            <Space>
              <Tag color={getStatusColor(bid.status)} icon={getStatusIcon(bid.status)}>
                {getStatusText(bid.status)}
              </Tag>
              <Text type="secondary">
                <DollarOutlined /> ₺{bid.amount?.toLocaleString()}
              </Text>
            </Space>
          </Space>
        }
        description={
          <Space direction="vertical" size={8} className="w-full">
            <Paragraph
              ellipsis={{ rows: 2, expandable: false }}
              className="mb-2"
            >
              <MessageOutlined className="mr-1" />
              {bid.message}
            </Paragraph>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <Space>
                <CalendarOutlined />
                <span>
                  {new Date(bid.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </Space>
              {bid.project?.employer?.name && (
                <Text type="secondary">
                  İşveren: {bid.project.employer.name}
                </Text>
              )}
            </div>
          </Space>
        }
      />
    </List.Item>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Teklif durumları yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="mb-2">
            <ClockCircleOutlined className="mr-2" />
            Teklif Durumları
          </Title>
          <Text type="secondary" className="text-lg">
            Tekliflerinizin durumunu takip edin ve başarı oranınızı görün
          </Text>
        </div>

        {/* İstatistikler */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Toplam Teklif"
                value={stats.total}
                prefix={<SendOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Bekleyen"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Kabul Edilen"
                value={stats.accepted}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Başarı Oranı"
                value={stats.successRate}
                prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
              <Progress
                percent={stats.successRate}
                showInfo={false}
                strokeColor="#722ed1"
                className="mt-2"
              />
            </Card>
          </Col>
        </Row>

        {/* Teklif Durumları Tabs */}
        <Card className="shadow-lg">
          <Tabs defaultActiveKey="all" size="large">
            <TabPane
              tab={
                <Space>
                  <SendOutlined />
                  <span>Tümü</span>
                  <Badge count={stats.total} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              }
              key="all"
            >
              {bids.length === 0 ? (
                <Empty
                  description="Henüz hiç teklif vermediniz."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={bids}
                  renderItem={renderBidCard}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true
                  }}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <ClockCircleOutlined />
                  <span>Bekleyen</span>
                  <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} />
                </Space>
              }
              key="pending"
            >
              {getBidsByStatus('pending').length === 0 ? (
                <Empty
                  description="Bekleyen teklifiniz bulunmamaktadır."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={getBidsByStatus('pending')}
                  renderItem={renderBidCard}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false
                  }}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <CheckCircleOutlined />
                  <span>Kabul Edilen</span>
                  <Badge count={stats.accepted} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              key="accepted"
            >
              {getBidsByStatus('accepted').length === 0 ? (
                <Empty
                  description="Henüz kabul edilen teklifiniz bulunmamaktadır."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={getBidsByStatus('accepted')}
                  renderItem={renderBidCard}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false
                  }}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <CloseCircleOutlined />
                  <span>Reddedilen</span>
                  <Badge count={stats.rejected} style={{ backgroundColor: '#ff4d4f' }} />
                </Space>
              }
              key="rejected"
            >
              {getBidsByStatus('rejected').length === 0 ? (
                <Empty
                  description="Reddedilen teklifiniz bulunmamaktadır."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={getBidsByStatus('rejected')}
                  renderItem={renderBidCard}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false
                  }}
                />
              )}
            </TabPane>
          </Tabs>
        </Card>

        {/* Başarı İpuçları */}
        {stats.total > 0 && stats.successRate < 30 && (
          <Card className="mt-6 border-l-4 border-l-orange-400">
            <Title level={4} className="text-orange-600">
              💡 Başarı İpuçları
            </Title>
            <ul className="text-gray-600 space-y-2">
              <li>• Teklif mesajınızda deneyimlerinizi ve yaklaşımınızı detaylı açıklayın</li>
              <li>• Projeye uygun ve rekabetçi fiyat teklifi verin</li>
              <li>• Portfolyonuzu güncel tutun ve ilgili çalışmalarınızı ekleyin</li>
              <li>• Hızlı yanıt verin ve profesyonel iletişim kurun</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BidStatus;

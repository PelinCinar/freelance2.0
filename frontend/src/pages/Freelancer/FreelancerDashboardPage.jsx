import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Button,
  List,
  Avatar,
  Tag,
  Space,
  Badge,
  Spin,
  Empty,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Divider
} from "antd";
import {
  ProjectOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined,
  SendOutlined,
  CalendarOutlined,
  TagOutlined,
  CheckCircleOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const FreelancerDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openProjects, setOpenProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    acceptedBids: 0,
    totalEarnings: 0
  });
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidForm] = Form.useForm();
  const [submittingBid, setSubmittingBid] = useState(false);

  // Açık projeleri getir
  const fetchOpenProjects = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/projects", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOpenProjects(data.data.slice(0, 6)); // İlk 6 projeyi göster
      }
    } catch (error) {
      console.error("Açık projeler alınamadı:", error);
    }
  };

  // Kendi tekliflerimi getir
  const fetchMyBids = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bids/open-projects-with-bids", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMyBids(data.data);

        // İstatistikleri hesapla
        const bidStats = {
          totalBids: data.data.length,
          activeBids: data.data.filter(bid => bid.status === "pending").length,
          acceptedBids: data.data.filter(bid => bid.status === "accepted").length,
          totalEarnings: data.data
            .filter(bid => bid.project.status === "completed" && bid.status === "accepted")
            .reduce((sum, bid) => sum + (bid.amount || 0), 0)
        };
        setStats(bidStats);
      }
    } catch (error) {
      console.error("Teklifler alınamadı:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchOpenProjects(), fetchMyBids()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Teklif ver modal'ını aç
  const handleBidProject = (project) => {
    setSelectedProject(project);
    setBidModalVisible(true);
    bidForm.resetFields();
  };

  // Teklif gönder
  const handleSubmitBid = async (values) => {
    setSubmittingBid(true);
    try {
      const res = await fetch(`http://localhost:8080/api/bids/${selectedProject._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: values.amount,
          message: values.message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        message.success("🎉 Teklifiniz başarıyla gönderildi!");
        setBidModalVisible(false);
        bidForm.resetFields();
        setSelectedProject(null);

        // Verileri yenile
        await Promise.all([fetchOpenProjects(), fetchMyBids()]);
      } else {
        message.error(data.message || "Teklif gönderilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Teklif gönderme hatası:", error);
      message.error("Sunucuya ulaşılamadı.");
    } finally {
      setSubmittingBid(false);
    }
  };

  // Proje kategorisi rengi
  const getCategoryColor = (category) => {
    const colors = {
      web: "blue",
      mobile: "green",
      design: "purple",
      other: "orange"
    };
    return colors[category] || "default";
  };

  // Proje kategorisi ikonu
  const getCategoryIcon = (category) => {
    const icons = {
      web: "🌐",
      mobile: "📱",
      design: "🎨",
      other: "🔧"
    };
    return icons[category] || "📋";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Dashboard yükleniyor...</Text>
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
            <ProjectOutlined className="mr-2" />
            Freelancer Dashboard
          </Title>
          <Text type="secondary" className="text-lg">
            Yeni projeler keşfedin ve tekliflerinizi yönetin
          </Text>
        </div>

        {/* İstatistikler */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Toplam Teklifim"
                value={stats.totalBids}
                prefix={<SendOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Bekleyen Teklif"
                value={stats.activeBids}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Kabul Edilen"
                value={stats.acceptedBids}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title="Toplam Kazanç"
                value={stats.totalEarnings}
                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                suffix="₺"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Sol Taraf - Açık Projeler */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <ProjectOutlined />
                  <span>Açık Projeler</span>
                  <Badge count={openProjects.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              }
              extra={
                <Button type="primary" onClick={() => navigate('/freelancer-panel/projects')}>
                  Tümünü Görüntüle
                </Button>
              }
              className="shadow-lg"
            >
              {openProjects.length === 0 ? (
                <Empty
                  description="Henüz açık proje bulunmamaktadır."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={openProjects}
                  renderItem={(project) => {
                    const hasMyBid = myBids.some(bid => bid.project._id === project._id);

                    return (
                      <List.Item
                        className="hover:bg-gray-50 transition-colors rounded-lg p-4"
                        actions={[
                          hasMyBid ? (
                            <Tag color="orange" icon={<ClockCircleOutlined />}>
                              Teklif Verildi
                            </Tag>
                          ) : (
                            <Button
                              type="primary"
                              icon={<SendOutlined />}
                              onClick={() => handleBidProject(project)}
                            >
                              Teklif Ver
                            </Button>
                          )
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size={48}
                              icon={<UserOutlined />}
                              style={{ backgroundColor: '#1890ff' }}
                            >
                              {project.employer?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                          }
                          title={
                            <Space direction="vertical" size={2}>
                              <Text strong className="text-lg">{project.title}</Text>
                              <Space>
                                <Text type="secondary">Employer:</Text>
                                <Text>{project.employer?.name || 'Bilinmiyor'}</Text>
                              </Space>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={8} className="w-full">
                              <Paragraph
                                ellipsis={{ rows: 2, expandable: false }}
                                className="mb-2"
                              >
                                {project.description}
                              </Paragraph>

                              <Space wrap>
                                <Tag color={getCategoryColor(project.category)}>
                                  {getCategoryIcon(project.category)} {project.category || 'Diğer'}
                                </Tag>
                                <Tag color="green">
                                  <DollarOutlined /> ₺{project.budget?.toLocaleString()}
                                </Tag>
                                <Tag color="blue">
                                  <TeamOutlined /> {project.bids?.length || 0} Teklif
                                </Tag>
                                {project.deadline && (
                                  <Tag color="orange">
                                    <CalendarOutlined /> {new Date(project.deadline).toLocaleDateString('tr-TR')}
                                  </Tag>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          {/* Sağ Taraf - Son Tekliflerim */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <SendOutlined />
                  <span>Son Tekliflerim</span>
                  <Badge count={myBids.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              extra={
                <Button type="link" onClick={() => navigate('/freelancer-panel/projects')}>
                  Tümünü Gör
                </Button>
              }
              className="shadow-lg"
            >
              {myBids.length === 0 ? (
                <Empty
                  description="Henüz teklif vermediniz."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={myBids.slice(0, 5)}
                  renderItem={(bid) => (
                    <List.Item className="px-0">
                      <List.Item.Meta
                        avatar={
                          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                            {bid.project?.title?.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={
                          <Text strong className="text-sm">
                            {bid.project?.title || 'Proje'}
                          </Text>
                        }
                        description={
                          <Space direction="vertical" size={2}>
                            <Space>
                              <Tag
                                color={
                                  bid.status === 'accepted' ? 'green' :
                                  bid.status === 'pending' ? 'orange' : 'red'
                                }
                                size="small"
                              >
                                {bid.status === 'accepted' ? 'Kabul Edildi' :
                                 bid.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                              </Tag>
                              <Text type="secondary" className="text-xs">
                                ₺{bid.amount?.toLocaleString()}
                              </Text>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Teklif Ver Modal */}
        <Modal
          title={
            <Space>
              <SendOutlined style={{ color: '#1890ff' }} />
              <span>Proje Teklifi Ver</span>
            </Space>
          }
          open={bidModalVisible}
          onCancel={() => {
            setBidModalVisible(false);
            bidForm.resetFields();
            setSelectedProject(null);
          }}
          footer={null}
          width={600}
        >
          {selectedProject && (
            <div className="space-y-4">
              {/* Proje Bilgileri */}
              <Card size="small" className="bg-gray-50">
                <Space direction="vertical" className="w-full">
                  <Text strong className="text-lg">{selectedProject.title}</Text>
                  <Text type="secondary">{selectedProject.description}</Text>

                  <Space wrap>
                    <Tag color={getCategoryColor(selectedProject.category)}>
                      {getCategoryIcon(selectedProject.category)} {selectedProject.category || 'Diğer'}
                    </Tag>
                    <Tag color="green">
                      <DollarOutlined /> Bütçe: ₺{selectedProject.budget?.toLocaleString()}
                    </Tag>
                    <Tag color="blue">
                      <UserOutlined /> {selectedProject.employer?.name}
                    </Tag>
                  </Space>
                </Space>
              </Card>

              <Divider />

              {/* Teklif Formu */}
              <Form
                form={bidForm}
                layout="vertical"
                onFinish={handleSubmitBid}
              >
                <Form.Item
                  name="amount"
                  label="Teklif Tutarınız (₺)"
                  rules={[
                    { required: true, message: 'Lütfen teklif tutarınızı girin!' },
                    { type: 'number', min: 1, message: 'Teklif tutarı 1₺ den az olamaz!' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Örn: 5000"
                    formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₺\s?|(,*)/g, '')}
                    min={1}
                    max={selectedProject.budget * 2} // Bütçenin 2 katına kadar
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Teklif Mesajınız"
                  rules={[
                    { required: true, message: 'Lütfen teklif mesajınızı yazın!' },
                    { min: 20, message: 'Mesaj en az 20 karakter olmalıdır!' },
                    { max: 500, message: 'Mesaj en fazla 500 karakter olabilir!' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Projeyi neden sizin yapmanız gerektiğini, deneyimlerinizi ve yaklaşımınızı açıklayın..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => {
                      setBidModalVisible(false);
                      bidForm.resetFields();
                      setSelectedProject(null);
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submittingBid}
                    icon={<SendOutlined />}
                  >
                    Teklif Gönder
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FreelancerDashboardPage;
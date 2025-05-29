import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Tag,
  Space,
  Avatar,
  Button,
  Spin,
  message,
  Descriptions,
  Divider,
  List,
  Modal,
  Form,
  Input,
  InputNumber,
  Badge
} from "antd";
import {
  ProjectOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  MessageOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [myBid, setMyBid] = useState(null);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidForm] = Form.useForm();
  const [submittingBid, setSubmittingBid] = useState(false);

  // Proje detayını getir
  const fetchProjectDetail = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      } else {
        message.error("Proje bulunamadı.");
        navigate("/freelancer-panel/open-projects");
      }
    } catch (error) {
      console.error("Proje detayı alınamadı:", error);
      message.error("Proje yüklenirken bir hata oluştu.");
      navigate("/freelancer-panel/open-projects");
    }
  };

  // Kendi teklifimi kontrol et
  const checkMyBid = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bids/my-bids", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const bid = data.data.find(bid => bid.project?._id === id);
        setMyBid(bid);
      }
    } catch (error) {
      console.error("Teklif kontrolü yapılamadı:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProjectDetail(), checkMyBid()]);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Teklif ver
  const handleSubmitBid = async (values) => {
    setSubmittingBid(true);
    try {
      const res = await fetch(`http://localhost:8080/api/bids/${id}`, {
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
        
        // Verileri yenile
        await Promise.all([fetchProjectDetail(), checkMyBid()]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Proje detayı yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <Title level={3}>Proje Bulunamadı</Title>
          <Text type="secondary">Aradığınız proje mevcut değil.</Text>
          <div className="mt-4">
            <Button type="primary" onClick={() => navigate("/freelancer-panel/open-projects")}>
              Açık Projelere Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Geri Dön
          </Button>
          
          <Card className="shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Title level={2} className="mb-2">
                  <ProjectOutlined className="mr-2" />
                  {project.title}
                </Title>
                
                <Space wrap className="mb-4">
                  <Tag color={getCategoryColor(project.category)} size="large">
                    {getCategoryIcon(project.category)} {project.category || 'Diğer'}
                  </Tag>
                  <Tag color="green" size="large">
                    <DollarOutlined /> ₺{project.budget?.toLocaleString()}
                  </Tag>
                  <Tag color="blue" size="large">
                    <TeamOutlined /> {project.bids?.length || 0} Teklif
                  </Tag>
                  {project.status === 'open' && (
                    <Tag color="green" size="large">
                      <ClockCircleOutlined /> Açık Proje
                    </Tag>
                  )}
                </Space>
              </div>
              
              {/* Teklif Durumu */}
              <div className="text-right">
                {myBid ? (
                  <div>
                    <Tag 
                      color={getStatusColor(myBid.status)} 
                      icon={getStatusIcon(myBid.status)}
                      size="large"
                    >
                      {myBid.status === 'pending' ? 'Teklif Bekliyor' :
                       myBid.status === 'accepted' ? 'Teklifim Kabul Edildi' :
                       'Teklifim Reddedildi'}
                    </Tag>
                    <div className="mt-2">
                      <Text strong>₺{myBid.amount?.toLocaleString()}</Text>
                    </div>
                  </div>
                ) : project.status === 'open' ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={() => setBidModalVisible(true)}
                  >
                    Teklif Ver
                  </Button>
                ) : (
                  <Tag color="red" size="large">
                    Proje Kapalı
                  </Tag>
                )}
              </div>
            </div>

            {/* Proje Açıklaması */}
            <Divider />
            <div>
              <Title level={4}>Proje Açıklaması</Title>
              <Paragraph className="text-gray-700 text-base leading-relaxed">
                {project.description}
              </Paragraph>
            </div>
          </Card>
        </div>

        {/* Proje Detayları */}
        <Card title="Proje Detayları" className="mb-6 shadow-lg">
          <Descriptions column={2} bordered>
            <Descriptions.Item 
              label={<><UserOutlined className="mr-2" />İşveren</>}
            >
              <Space>
                <Avatar
                  src={project.employer?.profileImage?.fileName ? 
                    `http://localhost:8080/api/upload/image/${project.employer.profileImage.fileName}` : null}
                  icon={<UserOutlined />}
                  size="small"
                />
                <Text strong>{project.employer?.name || 'Bilinmiyor'}</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<><DollarOutlined className="mr-2" />Bütçe</>}
            >
              <Text strong className="text-green-600">
                ₺{project.budget?.toLocaleString()}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<><CalendarOutlined className="mr-2" />Son Teklif Tarihi</>}
            >
              {project.deadline ? 
                new Date(project.deadline).toLocaleDateString('tr-TR') : 
                'Belirtilmemiş'
              }
            </Descriptions.Item>

            <Descriptions.Item 
              label={<><TeamOutlined className="mr-2" />Teklif Sayısı</>}
            >
              <Badge count={project.bids?.length || 0} style={{ backgroundColor: '#1890ff' }} />
            </Descriptions.Item>

            <Descriptions.Item 
              label={<><CalendarOutlined className="mr-2" />Oluşturulma Tarihi</>}
            >
              {new Date(project.createdAt).toLocaleDateString('tr-TR')}
            </Descriptions.Item>

            <Descriptions.Item 
              label={<><ProjectOutlined className="mr-2" />Proje Durumu</>}
            >
              <Tag color={project.status === 'open' ? 'green' : 'red'}>
                {project.status === 'open' ? 'Açık' : 'Kapalı'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Kendi Teklifim */}
        {myBid && (
          <Card 
            title={
              <Space>
                <MessageOutlined />
                <span>Teklifim</span>
                <Tag color={getStatusColor(myBid.status)} icon={getStatusIcon(myBid.status)}>
                  {myBid.status === 'pending' ? 'Bekliyor' :
                   myBid.status === 'accepted' ? 'Kabul Edildi' :
                   'Reddedildi'}
                </Tag>
              </Space>
            }
            className="mb-6 shadow-lg"
          >
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <Text strong className="text-lg">
                  Teklif Tutarı: ₺{myBid.amount?.toLocaleString()}
                </Text>
                <Text type="secondary">
                  {new Date(myBid.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="block mb-2">Teklif Mesajım:</Text>
                <Paragraph className="bg-white p-3 rounded border">
                  {myBid.message}
                </Paragraph>
              </div>
            </div>
          </Card>
        )}

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
          }}
          footer={null}
          width={600}
        >
          <div className="space-y-4">
            {/* Proje Özeti */}
            <Card size="small" className="bg-gray-50">
              <Text strong className="text-lg">{project.title}</Text>
              <div className="mt-2">
                <Tag color="green">
                  <DollarOutlined /> Bütçe: ₺{project.budget?.toLocaleString()}
                </Tag>
              </div>
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
                  max={project.budget * 2}
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
        </Modal>
      </div>
    </div>
  );
};

export default ProjectDetail;

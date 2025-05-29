import { useState, useEffect } from "react";
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
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Tooltip,
  Divider
} from "antd";
import {
  ProjectOutlined,
  DollarOutlined,
  UserOutlined,
  SendOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const OpenProjects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidForm] = Form.useForm();
  const [submittingBid, setSubmittingBid] = useState(false);
  const navigate = useNavigate();

  // Açık projeleri getir
  const fetchOpenProjects = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/projects", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Sadece açık projeleri filtrele
        const openProjects = data.data.filter(project => project.status === 'open');
        setProjects(openProjects);
      }
    } catch (error) {
      console.error("Açık projeler alınamadı:", error);
      message.error("Projeler yüklenirken bir hata oluştu.");
    }
  };

  // Kendi tekliflerimi getir
  const fetchMyBids = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/bids/my-bids", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMyBids(data.data);
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
            <Text>Açık projeler yükleniyor...</Text>
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
            Açık Projeler
          </Title>
          <Text type="secondary" className="text-lg">
            Teklif verebileceğiniz açık projeleri keşfedin
          </Text>
        </div>

        {/* Proje Sayısı */}
        <Card className="mb-6 text-center">
          <Space size="large">
            <div>
              <Text type="secondary">Toplam Açık Proje</Text>
              <div className="text-2xl font-bold text-blue-600">
                {projects.length}
              </div>
            </div>
            <Divider type="vertical" style={{ height: '60px' }} />
            <div>
              <Text type="secondary">Teklif Verdiğim Projeler</Text>
              <div className="text-2xl font-bold text-green-600">
                {myBids.filter(bid =>
                  projects.some(project => project._id === bid.project?._id)
                ).length}
              </div>
            </div>
          </Space>
        </Card>

        {/* Proje Listesi */}
        {projects.length === 0 ? (
          <Card className="text-center">
            <Empty
              description="Şu anda açık proje bulunmamaktadır."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {projects.map((project) => {
              const hasMyBid = myBids.some(bid => bid.project?._id === project._id);

              return (
                <Col xs={24} lg={12} xl={8} key={project._id}>
                  <Card
                    className="h-full hover:shadow-xl transition-all duration-300"
                    actions={[
                      <Tooltip title="Proje Detayı">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/freelancer-panel/project/${project._id}`)}
                        >
                          Detay
                        </Button>
                      </Tooltip>,
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
                    <Space direction="vertical" size="middle" className="w-full">
                      {/* Employer Bilgisi */}
                      <div className="flex items-center space-x-3">
                        <Avatar
                          size={40}
                          icon={<UserOutlined />}
                          style={{ backgroundColor: '#1890ff' }}
                        >
                          {project.employer?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <Text strong>{project.employer?.name || 'Bilinmiyor'}</Text>
                          <div className="text-xs text-gray-500">İşveren</div>
                        </div>
                      </div>

                      {/* Proje Başlığı */}
                      <div>
                        <Text strong className="text-lg block mb-2">
                          {project.title}
                        </Text>
                        <Paragraph
                          ellipsis={{ rows: 3, expandable: false }}
                          className="text-sm text-gray-600"
                        >
                          {project.description}
                        </Paragraph>
                      </div>

                      {/* Proje Etiketleri */}
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
                      </Space>

                      {/* Deadline */}
                      {project.deadline && (
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarOutlined className="mr-1" />
                          <span>
                            Son Tarih: {new Date(project.deadline).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}

                      {/* Proje Durumu */}
                      <div className="flex justify-between items-center">
                        <Tag color="green" icon={<ProjectOutlined />}>
                          Açık Proje
                        </Tag>
                        <Text type="secondary" className="text-xs">
                          {new Date(project.createdAt).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
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
                    max={selectedProject.budget * 2}
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

export default OpenProjects;

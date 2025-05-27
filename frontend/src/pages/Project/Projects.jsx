import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Spin,
  Badge,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Input,
  Select,
  Empty,
  Avatar,
  Tooltip,
  Progress,
  message
} from "antd";
import {
  CheckCircleOutlined,
  ProjectOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PayCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingProjectId, setPayingProjectId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalBudget: 0
  });

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

          // İstatistikleri hesapla
          const projectStats = {
            total: data.data.length,
            completed: data.data.filter(p => p.paymentStatus === 'completed').length,
            pending: data.data.filter(p => p.paymentStatus !== 'completed').length,
            totalBudget: data.data.reduce((sum, p) => sum + (p.budget || 0), 0)
          };
          setStats(projectStats);
        } else {
          console.error("Projeler alınamadı:", data.message);
          message.error("Projeler yüklenirken bir hata oluştu.");
        }
      } catch (error) {
        console.error("Projeleri çekerken bir hata oluştu:", error);
        message.error("Sunucuya ulaşılamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = [...projects];

    // Arama filtresi
    if (searchText) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(p => p.paymentStatus === 'completed');
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(p => p.paymentStatus !== 'completed');
      } else if (statusFilter === 'approved') {
        filtered = filtered.filter(p => p.isApproved);
      } else if (statusFilter === 'waiting') {
        filtered = filtered.filter(p => !p.isApproved);
      }
    }

    setFilteredProjects(filtered);
  }, [projects, searchText, statusFilter]);

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
        message.error("Ödeme başlatılırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Ödeme başlatılırken hata:", error);
      message.error("Sunucuya ulaşılamadı.");
    } finally {
      setPayingProjectId(null);
    }
  };

  const getStatusColor = (project) => {
    if (project.paymentStatus === 'completed') return 'success';
    if (project.isApproved) return 'processing';
    return 'warning';
  };

  const getStatusText = (project) => {
    if (project.paymentStatus === 'completed') return 'Tamamlandı';
    if (project.isApproved) return 'Onaylandı';
    return 'Beklemede';
  };

  const getStatusIcon = (project) => {
    if (project.paymentStatus === 'completed') return <CheckCircleOutlined />;
    if (project.isApproved) return <PayCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  const handleViewProject = (projectId) => {
    navigate(`/employer-panel/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    navigate('/employer-panel/projects/create'); // Proje oluşturma sayfasına yönlendir
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

  return (
    <div className="p-6 space-y-6">
      {/* Başlık ve Yeni Proje Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">Projelerim</Title>
          <Text type="secondary">Tüm projelerinizi buradan yönetebilirsiniz</Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateProject}
        >
          Yeni Proje Oluştur
        </Button>
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
              title="Tamamlanan"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Bekleyen"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Toplam Bütçe"
              value={stats.totalBudget}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              suffix="₺"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card title="Filtreler" className="shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Proje başlığı veya açıklama ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Select
              placeholder="Duruma göre filtrele"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            >
              <Option value="all">Tüm Projeler</Option>
              <Option value="completed">Tamamlanan</Option>
              <Option value="pending">Bekleyen</Option>
              <Option value="approved">Onaylanan</Option>
              <Option value="waiting">Onay Bekleyen</Option>
            </Select>
          </Col>
        </Row>
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
            description={projects.length === 0 ? "Henüz bir projeniz bulunmamaktadır." : "Filtrelere uygun proje bulunamadı."}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {projects.length === 0 && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
                İlk Projenizi Oluşturun
              </Button>
            )}
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredProjects.map((project) => (
              <Col xs={24} sm={12} lg={8} key={project._id}>
                <Card
                  className="hover:shadow-lg transition-all duration-300 h-full"
                  actions={[
                    <Tooltip title="Proje detaylarını görüntüle">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewProject(project._id)}
                      >
                        Detaylar
                      </Button>
                    </Tooltip>,
                    project.isApproved && project.paymentStatus !== "completed" ? (
                      <Tooltip title="Ödeme yap">
                        <Button
                          type="link"
                          icon={<PayCircleOutlined />}
                          loading={payingProjectId === project._id}
                          onClick={() => handlePayment(project._id)}
                        >
                          Öde
                        </Button>
                      </Tooltip>
                    ) : project.paymentStatus === "completed" ? (
                      <Tooltip title="Ödeme tamamlandı">
                        <Button type="link" icon={<CheckCircleOutlined />} disabled>
                          Ödendi
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Proje henüz onaylanmadı">
                        <Button type="link" icon={<ExclamationCircleOutlined />} disabled>
                          Beklemede
                        </Button>
                      </Tooltip>
                    )
                  ]}
                >
                  <div className="space-y-3">
                    {/* Başlık ve Durum */}
                    <div className="flex justify-between items-start">
                      <Title level={5} className="mb-0 flex-1 mr-2">
                        {project.title}
                      </Title>
                      <Tag
                        color={getStatusColor(project)}
                        icon={getStatusIcon(project)}
                      >
                        {getStatusText(project)}
                      </Tag>
                    </div>

                    {/* Açıklama */}
                    <Text type="secondary" className="block">
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </Text>

                    {/* Kategori ve Etiketler */}
                    <div className="space-y-2">
                      {/* Kategori */}
                      {project.category && (
                        <div>
                          <Tag
                            color={
                              project.category === 'web' ? 'blue' :
                              project.category === 'mobile' ? 'green' :
                              project.category === 'design' ? 'purple' : 'orange'
                            }
                            className="mb-1"
                          >
                            {project.category === 'web' ? '🌐 Web' :
                             project.category === 'mobile' ? '📱 Mobil' :
                             project.category === 'design' ? '🎨 Tasarım' : '🔧 Diğer'}
                          </Tag>
                        </div>
                      )}

                      {/* Etiketler */}
                      {project.tags && project.tags.length > 0 && (
                        <div>
                          <Text type="secondary" className="text-xs block mb-1">Etiketler:</Text>
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag, index) => (
                              <Tag key={index} size="small" color="default">
                                {tag}
                              </Tag>
                            ))}
                            {project.tags.length > 3 && (
                              <Tag size="small" color="default">
                                +{project.tags.length - 3} daha
                              </Tag>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Proje Bilgileri */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text strong>Bütçe:</Text>
                        <Text className="text-green-600 font-semibold">
                          {project.budget}₺
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text strong>Teklif Sayısı:</Text>
                        <Badge count={project.bids.length} style={{ backgroundColor: '#1890ff' }} />
                      </div>
                      <div className="flex justify-between">
                        <Text strong>Oluşturulma:</Text>
                        <Text type="secondary">
                          {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </div>
                    </div>

                    {/* Progress Bar (Teklif sayısına göre) */}
                    <div>
                      <Text type="secondary" className="text-xs">
                        Teklif Durumu
                      </Text>
                      <Progress
                        percent={Math.min(100, (project.bids.length / 5) * 100)}
                        size="small"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        showInfo={false}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default Projects;
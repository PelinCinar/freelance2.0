// components/Employer/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Divider,
  Progress,
  Badge,
  Empty
} from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    activeFreelancers: 0
  });
  const [completedProjects, setCompletedProjects] = useState([]);

  // API'den tamamlanan projeleri çek
  const fetchCompletedProjects = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.COMPLETED_PROJECTS, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const projects = data.data.slice(0, 5); // Sadece ilk 5 projeyi göster
        setCompletedProjects(projects);

        // İstatistikleri güncelle
        setStats(prev => ({
          ...prev,
          completedProjects: data.count,
          totalSpent: data.totalAmount,
          activeFreelancers: new Set(projects.map(p => p.freelancer)).size // Unique freelancer sayısı
        }));
      } else {
        console.error("Tamamlanan projeler alınamadı");
      }
    } catch (err) {
      console.error("API hatası:", err);
    }
  };

  // Tüm projeleri çek (toplam proje sayısı için)
  const fetchAllProjects = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MY_PROJECTS, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          totalProjects: data.data.length
        }));
      }
    } catch (err) {
      console.error("Projeler alınamadı:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCompletedProjects(),
        fetchAllProjects()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleViewProject = (projectId) => {
    navigate(`/employer-panel/projects/${projectId}`);
  };

  const handleViewAllCompleted = () => {
    navigate('/employer-panel/completed-projects');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Başlık */}
      <div className="mb-6">
        <Title level={2} className="mb-2">İşveren Dashboard</Title>
        <Text type="secondary">Projelerinizi ve istatistiklerinizi buradan takip edebilirsiniz.</Text>
      </div>

      {/* İstatistikler */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Toplam Proje"
              value={stats.totalProjects}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Tamamlanan Proje"
              value={stats.completedProjects}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Toplam Harcama"
              value={stats.totalSpent}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <Statistic
              title="Aktif Freelancer"
              value={stats.activeFreelancers}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Ödenen Projeler Bölümü */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Ödenen Projeler</span>
            <Badge count={completedProjects.length} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Button type="primary" onClick={handleViewAllCompleted}>
            Tümünü Görüntüle
          </Button>
        }
        className="shadow-lg"
      >
        {completedProjects.length > 0 ? (
          <List
            dataSource={completedProjects}
            renderItem={(project) => (
              <List.Item
                className="hover:bg-gray-50 transition-colors rounded-lg p-4"
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewProject(project.id)}
                  >
                    Detay
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      src={project.freelancerAvatar ? `http://localhost:8080${project.freelancerAvatar}` : null}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  }
                  title={
                    <Space direction="vertical" size={0}>
                      <Text strong className="text-lg">{project.title}</Text>
                      <Space>
                        <Text type="secondary">Freelancer:</Text>
                        <Text>{project.freelancer}</Text>
                      </Space>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4} className="w-full">
                      <Space wrap>
                        <Tag color="green" icon={<DollarOutlined />}>
                          {project.amount}₺
                        </Tag>
                        <Tag color="blue" icon={<CalendarOutlined />}>
                          {new Date(project.completedDate).toLocaleDateString('tr-TR')}
                        </Tag>
                        <Tag color="gold" icon={<StarOutlined />}>
                          {project.rating}/5
                        </Tag>
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Ödeme Tamamlandı
                        </Tag>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="Henüz tamamlanmış projeniz bulunmamaktadır."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Başarı Oranı */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Proje Başarı Oranı" className="shadow-lg">
            <div className="text-center">
              <Progress
                type="circle"
                percent={Math.round((stats.completedProjects / stats.totalProjects) * 100)}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size={120}
              />
              <Paragraph className="mt-4 text-gray-600">
                {stats.totalProjects} projeden {stats.completedProjects} tanesi başarıyla tamamlandı.
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Hızlı Erişim" className="shadow-lg">
            <Space direction="vertical" className="w-full" size="middle">
              <Button
                type="primary"
                block
                size="large"
                icon={<ProjectOutlined />}
                onClick={() => navigate('/employer-panel/projects')}
              >
                Tüm Projelerim
              </Button>
              <Button
                type="default"
                block
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={handleViewAllCompleted}
              >
                Tamamlanan Projeler
              </Button>
              <Button
                type="default"
                block
                size="large"
                icon={<TrophyOutlined />}
                onClick={() => navigate('/profile')}
              >
                Profilim
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployerDashboard;

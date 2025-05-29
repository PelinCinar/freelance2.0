import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Statistic,
  Rate,
  Empty,
  Spin
} from 'antd';
import {
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../utils/api';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CompletedProjects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [dateRange, setDateRange] = useState(null);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    averageRating: 0,
    count: 0
  });

  // API'den tamamlanan projeleri çek
  const fetchCompletedProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.COMPLETED_PROJECTS, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedProjects(data.data);
        setStats({
          totalAmount: data.totalAmount || 0,
          averageRating: data.averageRating || 0,
          count: data.count || 0
        });
      } else {
        const errorData = await res.json();
        console.error("Tamamlanan projeler alınamadı:", errorData.message);
      }
    } catch (err) {
      console.error("API hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = [...completedProjects];

    // Arama filtresi
    if (searchText) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchText.toLowerCase()) ||
        project.freelancer.toLowerCase().includes(searchText.toLowerCase()) ||
        project.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Tarih filtresi
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.completedDate);
        return projectDate >= dateRange[0].toDate() && projectDate <= dateRange[1].toDate();
      });
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedDate) - new Date(a.completedDate);
        case 'amount':
          return b.amount - a.amount;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  }, [searchText, sortBy, dateRange, completedProjects]);

  const handleViewProject = (projectId) => {
    navigate(`/employer-panel/projects/${projectId}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': 'blue',
      'Design': 'purple',
      'Marketing': 'orange',
      'Mobile Development': 'green'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Başlık */}
      <div className="mb-6">
        <Title level={2} className="mb-2">Tamamlanan Projeler</Title>
        <Text type="secondary">Başarıyla tamamlanan ve ödemesi yapılan projeleriniz</Text>
      </div>

      {/* İstatistikler */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Toplam Proje"
              value={stats.count}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Toplam Harcama"
              value={stats.totalAmount}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Ortalama Puan"
              value={stats.averageRating}
              precision={1}
              prefix={<StarOutlined style={{ color: '#ff7a45' }} />}
              suffix="/ 5"
              valueStyle={{ color: '#ff7a45' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card title="Filtreler" className="shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Proje, freelancer veya kategori ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Sırala"
              value={sortBy}
              onChange={setSortBy}
              className="w-full"
            >
              <Option value="date">Tarihe Göre</Option>
              <Option value="amount">Tutara Göre</Option>
              <Option value="rating">Puana Göre</Option>
              <Option value="title">İsme Göre</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10}>
            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
            />
          </Col>
        </Row>
      </Card>

      {/* Projeler Listesi */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Projeler ({filteredProjects.length})</span>
          </Space>
        }
        className="shadow-lg"
      >
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <List
            dataSource={filteredProjects}
            renderItem={(project) => (
              <List.Item
                className="hover:bg-gray-50 transition-colors rounded-lg p-4"
                actions={[
                  <Button
                    key="view"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewProject(project.id)}
                  >
                    Detay Görüntüle
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={56}
                      src={project.freelancerAvatar ? `http://localhost:8080${project.freelancerAvatar}` : null}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  }
                  title={
                    <Space direction="vertical" size={2}>
                      <Text strong className="text-lg">{project.title}</Text>
                      <Space>
                        <Text type="secondary">Freelancer:</Text>
                        <Text className="font-medium">{project.freelancer}</Text>
                      </Space>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={8} className="w-full">
                      <Text type="secondary">{project.description}</Text>
                      <Space wrap>
                        <Tag color={getCategoryColor(project.category)}>
                          {project.category}
                        </Tag>
                        <Tag color="green" icon={<DollarOutlined />}>
                          {project.amount}₺
                        </Tag>
                        <Tag color="blue" icon={<CalendarOutlined />}>
                          {new Date(project.completedDate).toLocaleDateString('tr-TR')}
                        </Tag>
                        <Tag color="gold">
                          <StarOutlined /> {project.rating}/5
                        </Tag>
                        <Tag color="cyan">
                          Süre: {project.duration}
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
            description="Filtrelere uygun proje bulunamadı."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default CompletedProjects;

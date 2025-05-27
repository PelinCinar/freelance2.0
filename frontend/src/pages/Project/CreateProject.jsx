import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Typography,
  Space,
  Tag,
  message,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import {
  ProjectOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagsOutlined,
  FileTextOutlined,
  PlusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateProject = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customTags, setCustomTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Proje kategorileri
  const categories = [
    { value: 'web', label: '🌐 Web Geliştirme', color: '#1890ff' },
    { value: 'mobile', label: '📱 Mobil Uygulama', color: '#52c41a' },
    { value: 'design', label: '🎨 Tasarım', color: '#722ed1' },
    { value: 'other', label: '🔧 Diğer', color: '#fa8c16' }
  ];

  // Önceden tanımlı etiketler
  const predefinedTags = {
    web: ['React', 'Vue.js', 'Angular', 'Node.js', 'PHP', 'Laravel', 'WordPress', 'E-ticaret'],
    mobile: ['React Native', 'Flutter', 'iOS', 'Android', 'Hybrid App', 'Native App'],
    design: ['Logo Tasarım', 'UI/UX', 'Grafik Tasarım', 'Web Tasarım', 'Mobil Tasarım', 'Branding'],
    other: ['SEO', 'Dijital Pazarlama', 'İçerik Yazımı', 'Çeviri', 'Veri Girişi']
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const projectData = {
        title: values.title,
        description: values.description,
        budget: values.budget,
        category: values.category,
        tags: [...(values.tags || []), ...customTags],
        deadline: values.deadline ? values.deadline.toISOString() : null
      };

      const res = await fetch('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData)
      });

      if (res.ok) {
        message.success('🎉 Proje başarıyla oluşturuldu!');

        // 2 saniye bekleyip yönlendir
        setTimeout(() => {
          navigate('/employer-panel/projects');
        }, 2000);
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Proje oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
      message.error('Sunucuya ulaşılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomTag = () => {
    if (tagInput.trim() && !customTags.includes(tagInput.trim())) {
      setCustomTags([...customTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveCustomTag = (tagToRemove) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const selectedCategory = Form.useWatch('category', form);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/employer-panel/projects')}
          className="mb-4"
        >
          Geri Dön
        </Button>
        <Title level={2} className="mb-2">
          <ProjectOutlined className="mr-2" />
          Yeni Proje Oluştur
        </Title>
        <Text type="secondary" className="text-lg">
          Projenizi detaylarıyla birlikte tanımlayın ve freelancer'lardan teklif almaya başlayın.
        </Text>
      </div>

      {/* Info Alert */}
      <Alert
        message="💡 İpucu"
        description="Projenizi ne kadar detaylı tanımlarsanız, o kadar kaliteli teklifler alırsınız. Bütçenizi gerçekçi belirleyin ve proje gereksinimlerinizi açık bir şekilde yazın."
        type="info"
        showIcon
        className="mb-6"
      />

      <Card className="shadow-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Row gutter={[24, 24]}>
            {/* Proje Başlığı */}
            <Col xs={24}>
              <Form.Item
                name="title"
                label={
                  <Space>
                    <FileTextOutlined />
                    <span className="font-semibold">Proje Başlığı</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Proje başlığı zorunludur!' },
                  { min: 10, message: 'Başlık en az 10 karakter olmalıdır!' },
                  { max: 100, message: 'Başlık en fazla 100 karakter olabilir!' }
                ]}
              >
                <Input
                  placeholder="Örn: Modern e-ticaret sitesi geliştirilmesi"
                  size="large"
                  showCount
                  maxLength={100}
                />
              </Form.Item>
            </Col>

            {/* Kategori ve Bütçe */}
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label={
                  <Space>
                    <TagsOutlined />
                    <span className="font-semibold">Proje Kategorisi</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Kategori seçimi zorunludur!' }]}
              >
                <Select
                  placeholder="Kategori seçin"
                  size="large"
                  optionLabelProp="label"
                >
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value} label={cat.label}>
                      <Space>
                        <Tag color={cat.color}>{cat.label}</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="budget"
                label={
                  <Space>
                    <DollarOutlined />
                    <span className="font-semibold">Bütçe (₺)</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Bütçe zorunludur!' },
                  { type: 'number', min: 100, message: 'Minimum bütçe 100₺ olmalıdır!' }
                ]}
              >
                <InputNumber
                  placeholder="5000"
                  size="large"
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₺\s?|(,*)/g, '')}
                  min={100}
                  max={1000000}
                />
              </Form.Item>
            </Col>

            {/* Proje Açıklaması */}
            <Col xs={24}>
              <Form.Item
                name="description"
                label={
                  <Space>
                    <FileTextOutlined />
                    <span className="font-semibold">Proje Açıklaması</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Proje açıklaması zorunludur!' },
                  { min: 50, message: 'Açıklama en az 50 karakter olmalıdır!' },
                  { max: 2000, message: 'Açıklama en fazla 2000 karakter olabilir!' }
                ]}
              >
                <TextArea
                  placeholder="Projenizi detaylı bir şekilde açıklayın. Hangi teknolojiler kullanılacak, hangi özellikler olacak, tasarım tercihleri neler gibi..."
                  rows={6}
                  showCount
                  maxLength={2000}
                />
              </Form.Item>
            </Col>

            {/* Etiketler */}
            <Col xs={24}>
              <Form.Item
                name="tags"
                label={
                  <Space>
                    <TagsOutlined />
                    <span className="font-semibold">Proje Etiketleri</span>
                  </Space>
                }
              >
                <Select
                  mode="multiple"
                  placeholder="Projenizle ilgili etiketler seçin"
                  size="large"
                  disabled={!selectedCategory}
                >
                  {selectedCategory && predefinedTags[selectedCategory]?.map(tag => (
                    <Option key={tag} value={tag}>{tag}</Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Özel Etiket Ekleme */}
              <div className="mb-4">
                <Text strong>Özel Etiket Ekle:</Text>
                <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                  <Input
                    placeholder="Özel etiket yazın"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onPressEnter={handleAddCustomTag}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddCustomTag}
                    disabled={!tagInput.trim()}
                  >
                    Ekle
                  </Button>
                </Space.Compact>
              </div>

              {/* Özel Etiketler */}
              {customTags.length > 0 && (
                <div>
                  <Text strong>Özel Etiketler:</Text>
                  <div className="mt-2">
                    {customTags.map(tag => (
                      <Tag
                        key={tag}
                        closable
                        onClose={() => handleRemoveCustomTag(tag)}
                        color="blue"
                        className="mb-2"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Col>

            {/* Teslim Tarihi */}
            <Col xs={24} md={12}>
              <Form.Item
                name="deadline"
                label={
                  <Space>
                    <CalendarOutlined />
                    <span className="font-semibold">Teslim Tarihi (Opsiyonel)</span>
                  </Space>
                }
              >
                <DatePicker
                  placeholder="Teslim tarihi seçin"
                  size="large"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().endOf('day')}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Submit Buttons */}
          <div className="text-center">
            <Space size="large">
              <Button
                size="large"
                onClick={() => navigate('/employer-panel/projects')}
              >
                İptal
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<ProjectOutlined />}
              >
                Projeyi Oluştur
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateProject;

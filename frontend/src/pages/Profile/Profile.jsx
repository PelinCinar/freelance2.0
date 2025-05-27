import { useState } from "react";
import { Card, Typography, Spin, Row, Col } from "antd";

// Components
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import PortfolioCard from "./components/PortfolioCard";
import PanelAccess from "./components/PanelAccess";
import ProfileEditModal from "./components/ProfileEditModal";

// Hooks
import { useProfile } from "./hooks/useProfile";

const { Title, Text } = Typography;

export default function Profile() {
  const { user, loading, stats, fetchUser, updateUser } = useProfile();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleModalCancel = () => {
    setEditModalVisible(false);
  };

  const handleProfileUpdate = (newUserData) => {
    if (newUserData) {
      updateUser(newUserData);
    } else {
      fetchUser(); // Refresh user data
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="p-8">
            <Text>Profil yükleniyor...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <Title level={4}>Kullanıcı bilgisi bulunamadı</Title>
          <Text type="secondary">Lütfen tekrar giriş yapmayı deneyin.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <Row gutter={[24, 24]}>
          {/* Sol Taraf - Profil Kartı */}
          <Col xs={24} lg={8}>
            <Card className="text-center shadow-lg">
              <ProfileHeader
                user={user}
                onEditProfile={handleEditProfile}
                onProfileUpdate={handleProfileUpdate}
              />
            </Card>
          </Col>

          {/* Sağ Taraf - Detaylar ve İstatistikler */}
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* İstatistikler Kartı */}
              <ProfileStats user={user} stats={stats} />

              {/* Portfolyo Kartı */}
              <PortfolioCard user={user} onProfileUpdate={handleProfileUpdate} />

              {/* Panel Erişim Kartı */}
              <PanelAccess user={user} />
            </div>
          </Col>
        </Row>

        {/* Profil Düzenleme Modal */}
        <ProfileEditModal
          visible={editModalVisible}
          onCancel={handleModalCancel}
          user={user}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  );
}
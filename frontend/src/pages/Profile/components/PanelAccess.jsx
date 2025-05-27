import { Card, Row, Col, Button, Tag } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { Typography } from "antd";
const { Paragraph } = Typography;

export default function PanelAccess({ user }) {
  const navigate = useNavigate();

  const getRoleColor = (role) => {
    switch (role) {
      case "employer":
        return "blue";
      case "freelancer":
        return "green";
      case "admin":
        return "red";
      default:
        return "default";
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "employer":
        return "İşveren";
      case "freelancer":
        return "Freelancer";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  const handleProjectsClick = () => {
    if (user.role === 'employer') {
      navigate("/employer-panel/projects");
    } else {
      navigate("/freelancer-panel/my-bids");
    }
  };

  const handleDashboardClick = () => {
    if (user.role === 'employer') {
      navigate("/employer-panel/dashboard");
    } else {
      navigate("/freelancer-panel/dashboard");
    }
  };

  return (
    <Card
      title="Panel Erişimi"
      className="shadow-lg"
      extra={
        <Tag color={getRoleColor(user.role)}>
          {getRoleText(user.role)} Paneli
        </Tag>
      }
    >
      <Paragraph type="secondary" className="mb-4">
        {user.role === 'employer'
          ? 'İşveren panelinizden projelerinizi yönetebilir, freelancer\'larla iletişim kurabilirsiniz.'
          : 'Freelancer panelinizden projelere teklif verebilir, işlerinizi takip edebilirsiniz.'
        }
      </Paragraph>

      <Row gutter={[16, 16]}>
        {user.role === "employer" && (
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              icon={<DashboardOutlined />}
              onClick={handleDashboardClick}
              block
              size="large"
            >
              İşveren Paneline Git
            </Button>
          </Col>
        )}
        {user.role === "freelancer" && (
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              icon={<DashboardOutlined />}
              onClick={handleDashboardClick}
              block
              size="large"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Freelancer Paneline Git
            </Button>
          </Col>
        )}
        <Col xs={24} sm={12}>
          <Button
            type="default"
            icon={<FileTextOutlined />}
            block
            size="large"
            onClick={handleProjectsClick}
          >
            {user.role === 'employer' ? 'Projelerim' : 'Tekliflerim'}
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

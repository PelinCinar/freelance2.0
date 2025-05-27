import { Card, Row, Col, Statistic, Progress, Badge } from "antd";
import {
  TrophyOutlined,
  FileTextOutlined,
  StarOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function ProfileStats({ user, stats }) {
  const navigate = useNavigate();

  const handleCompletedJobsClick = () => {
    if (user.role === 'employer') {
      navigate("/employer-panel/completed-projects");
    } else {
      navigate("/freelancer-panel/completed-jobs");
    }
  };

  const handleTotalProjectsClick = () => {
    if (user.role === 'employer') {
      navigate("/employer-panel/projects");
    } else {
      // Freelancer için portfolyo kartına scroll yap
      document.querySelector('[data-portfolio-card]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <Card title="Hesap İstatistikleri" className="shadow-lg">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic
            title="Profil Tamamlanma"
            value={stats.completionRate}
            suffix="%"
            prefix={<TrophyOutlined />}
          />
          <Progress percent={stats.completionRate} size="small" />
        </Col>

        <Col xs={12} sm={6}>
          <div
            className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            onClick={handleTotalProjectsClick}
            title={user.role === 'employer' ?
              "Tüm projelerinizi görüntülemek için tıklayın" :
              "Portfolyo dosyalarınızı görüntülemek için tıklayın"
            }
          >
            <Statistic
              title={user.role === 'employer' ? "Toplam Proje" : "Portfolyo Dosyası"}
              value={stats.totalProjects}
              prefix={<FileTextOutlined />}
            />
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <Statistic
            title="Ortalama Puan"
            value={stats.averageRating}
            precision={1}
            prefix={<StarOutlined />}
            suffix="/ 5"
          />
        </Col>

        <Col xs={12} sm={6}>
          <Badge count={stats.completedJobs} offset={[10, 0]}>
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              onClick={handleCompletedJobsClick}
              title={`${user.role === 'employer' ? 'Tamamlanan projelerinizi' : 'Tamamlanan işlerinizi'} görüntülemek için tıklayın`}
            >
              <Statistic
                title="Tamamlanan İş"
                value={stats.completedJobs}
                prefix={<CheckCircleOutlined />}
              />
            </div>
          </Badge>
        </Col>
      </Row>
    </Card>
  );
}

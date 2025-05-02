import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { io } from "socket.io-client";

// Socket.io'yu başlatıyoruz
const socket = io("http://localhost:8080");

const CardDetail = () => {
  const { id } = useParams();  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // useNavigate kullanıyoruz

  // Proje detayını fetch etme
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setProject(data.data); // Projeyi set ediyoruz
        } else {
          message.error("Projeler alınamadı.");
        }
      } catch (error) {
        console.error("Proje detayı alınırken hata oluştu:", error);
        message.error("Proje detayı alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Eğer proje yoksa ya da yükleniyorsa, bekleme ekranı göster
  if (loading) return <div>Yükleniyor...</div>;
  if (!project) return <div>Proje bulunamadı.</div>;

  // Sohbete başla butonu işlevi
  const startChat = () => {
    if (project.acceptedBid) {
      const roomId = project.acceptedBid._id; // Teklif ID'si ile oda ismi
      socket.emit("joinRoom", roomId); // Odaya katıl
      message.success("Sohbet odasına katıldınız.");
      
      // Sohbet odasına yönlendir
      navigate(`/chat/${project._id}`);  // Proje ID'sine göre sohbet odasına yönlendiriyoruz
    } else {
      message.error("Kabul edilen teklif bulunamadı.");
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow space-y-4 relative">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-700">{project.description}</p>
      <p><strong>Bütçe:</strong> ${project.budget}</p>
      <p><strong>Durum:</strong> {project.status}</p>
      <p><strong>Teklif Sayısı:</strong> {project.bids.length}</p>
      <p><strong>Kabul Edilen Teklif ID:</strong> {project.acceptedBid ? project.acceptedBid._id : "Henüz kabul edilmedi"}</p>
      
      <p><strong>Gönderilen Dosyalar:</strong></p>
      <ul className="list-disc list-inside">
        {project.projectSubmissions.map(file => (
          <li key={file._id}>
            <a
              href={`http://localhost:8080${file.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-blue-500 underline"
            >
              {file.fileName}
            </a> – {new Date(file.uploadedAt).toLocaleString()}
          </li>
        ))}
      </ul>

      <p><strong>Ortalama Puan:</strong> {project.rating.average || "Henüz yok"}</p>
      <p><strong>Oluşturulma:</strong> {new Date(project.createdAt).toLocaleString()}</p>

      {/* Sohbete başla butonu, kabul edilen teklif varsa aktif olacak */}
      {project.acceptedBid && (
        <Button
          type="primary"
          onClick={startChat}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            display: "inline-block",
          }}
        >
          Sohbete Başla
        </Button>
      )}

      {/* Eğer kabul edilen teklif yoksa buton pasif olacak */}
      {!project.acceptedBid && (
        <Button
          type="default"
          disabled
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            display: "inline-block",
          }}
        >
          Sohbete Başla
        </Button>
      )}
    </div>
  );
};

export default CardDetail;

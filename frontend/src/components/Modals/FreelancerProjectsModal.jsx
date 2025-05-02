import React, { useState, useEffect } from "react";
import { Modal, Input, message, Typography } from "antd";

const { Text } = Typography;

const FreelancerProjectsModal = ({ visible, onCancel, onOk, bid }) => {
  const [amount, setAmount] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (bid) {
      setAmount(bid.amount.toString());
      setMessageText(bid.message);
    }
  }, [bid]);

  const handleUpdateBid = async () => {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      message.warning("Lütfen geçerli bir teklif miktarı girin.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/bids/${bid._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: bid.projectId,
            amount: numericAmount,
            message: messageText,
          }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        message.success("Teklif başarıyla güncellendi!");
        onOk(numericAmount, messageText);
      } else {
        message.error("Teklif güncellenemedi.");
      }
    } catch (error) {
      message.error(`Hata: ${error.message}`);
    }
  };

  return (
    <Modal
      title="Teklif Güncelle"
      open={visible}
      onCancel={onCancel}
      onOk={handleUpdateBid}
    >
      {bid?.project?.title && (
        <div style={{ marginBottom: "1rem" }}>
          <Text strong>Proje: </Text>
          <Text>{bid.project.title}</Text>
        </div>
      )}
      <Input
        value={amount}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
          }
        }}
        placeholder="Teklif Miktarı (sadece sayı)"
      />
      <Input.TextArea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Mesaj"
        rows={4}
        style={{ marginTop: "1rem" }}
      />
    </Modal>
  );
};

export default FreelancerProjectsModal;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Project = require("../models/Project");
const YOUR_CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";


const createCheckoutSession = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log("Gelen projectId:", projectId);

    // Projeyi bul
    const project = await Project.findById(projectId).populate("bids");
    if (!project) {
      console.log("Proje bulunamadı.");
      return res
        .status(400)
        .json({ success: false, message: "Proje bulunamadı." });
    }
    console.log("Bulunan proje:", project.title);

    // Kabul edilen teklifi bul
    const acceptedBid = project.bids.find((bid) => bid.status === "accepted");
    if (!acceptedBid) {
      console.log("Kabul edilen teklif bulunamadı.");
      return res
        .status(400)
        .json({ success: false, message: "Kabul edilen teklif bulunamadı." });
    }
    console.log("Kabul edilen teklif miktarı:", acceptedBid.amount);

    // Stripe ödeme oturumunu oluştur
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: project.title,
              description: project.description,
            },
            unit_amount: acceptedBid.amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${YOUR_CLIENT_URL}/payment-cancelled`,
      metadata: { projectId: projectId },
    });

    console.log("Stripe session oluşturuldu:", session.url);

    // Başarıyla URL gönder
    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Hatası:", error);
    res.status(500).json({ success: false, message: "Ödeme başlatılamadı" });
  }
};

/**
 * Stripe webhook işleyici fonksiyonu
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Checkout tamamlandığında
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Payment successful for session:", session.id);

    if (!session.metadata || !session.metadata.projectId) {
      console.error("Metadata veya projectId eksik!");
      return res.status(400).json({ error: "Metadata eksik" });
    }

    try {
      const updatedProject = await Project.findByIdAndUpdate(
        session.metadata.projectId,
        { 
          paymentStatus: "completed",
          status: "in-progress",
          paidAt: new Date(),
          paymentId: session.payment_intent
        },
        { new: true }
      );
      
      if (!updatedProject) {
        console.error("Proje bulunamadı:", session.metadata.projectId);
        return res.status(404).json({ error: "Proje bulunamadı" });
      }
      
      console.log("Proje başarıyla güncellendi:", updatedProject._id);
    } catch (dbError) {
      console.error("Veritabanı güncelleme hatası:", dbError);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
  }

  res.status(200).json({ received: true });
};

const getPaymentStatus = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Ödeme başarılıysa direkt güncelle
    if (session.payment_status === 'paid') {
      await Project.findByIdAndUpdate(
        session.metadata.projectId,
        { paymentStatus: "completed" }
      );
      return res.json({ status: "completed" });
    }

    // Değilse veritabanındaki durumu dön
    const project = await Project.findById(session.metadata.projectId);
    res.json({ status: project?.paymentStatus || "pending" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment status check failed" });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPaymentStatus
};

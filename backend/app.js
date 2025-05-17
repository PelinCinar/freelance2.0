require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/authRoutes.js");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swaggerConfig.js");
const corsOptions = require("./src/config/corsConfig.js");
const {
  logEventsMiddleware,
} = require("./src/middlewares/logEventsMiddleware.js");
const errorHandler = require("./src/middlewares/errorHandler.js");
const userRoutes = require("./src/routes/userRoutes.js");
const projectRoutes = require("./src/routes/projectRoutes.js");
const bidRoutes = require("./src/routes/bidRoutes.js");
const uploadRoutes = require("./src/routes/uploadRoutes.js");
const reviewRoutes = require("./src/routes/reviewRoutes.js");
const notificationRoutes = require("./src/routes/notificationRoutes.js");
const paymentRoutes = require("./src/routes/paymentRoutes.js");

const path = require("path");

const helmet = require("helmet");//!uygulamanın her response’una (cevaplarına) otomatik olarak ekstra güvenlik başlıkları (security headers) eklendi.
const limiter = require("./src/middlewares/rateLimitingMiddleware.js"); // Middleware'i import et

const { handleWebhook } = require("./src/controllers/paymentController");


const app = express();



// Middleware
app.use(helmet());
app.use(cors(corsOptions));
//!Stripe webhook için özel middleware
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
app.use(express.json());

app.use(cookieParser());
app.use(logEventsMiddleware);
app.use("/api/", limiter);//!tüm isteklere uyguladık
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 //uploads klasöründeki dosyaları statik olarak sunar vee  tarayıcıya gelen istekler doğru şekilde işler


// Swagger dokümantasyonu
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "success.html"));
});

app.use(errorHandler);//!en sonda olmalı çünkü ecpress nexterr çağrıldığında devreye grecek

module.exports = app;

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

const path = require("path");

const app = express();
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(logEventsMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", reviewRoutes);
app.use("/uploads", express.static("uploads")); //uploads klasöründeki dosyaları statik olarak sunar vee  tarayıcıya gelen istekler doğru şekilde işler


// Swagger dokümantasyonu
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(errorHandler);

module.exports = app;

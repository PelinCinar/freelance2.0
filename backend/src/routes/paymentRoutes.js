const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/checkout-session", paymentController.createCheckoutSession);


// router.post("/webhook", paymentController.handleWebhook);//app.js içerisinde rawlamak lazım. Dikkat et.

router.get('/status', paymentController.getPaymentStatus);


module.exports = router; 
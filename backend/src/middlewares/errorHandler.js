const { logEvents } = require("./logEventsMiddleware.js");
const errorHandler = (err, req, res, next) => {
    // Hata loglama mesajını oluştur
    const errorMessage = `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`;
    
    logEvents(errorMessage, "errLog.log");
  
    console.error(err.stack);
  
    // Hata kodu belirleme
    const status = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(status);
  
    res.json({
      message: err.message, 
      stack: process.env.NODE_ENV === "production" ? null : err.stack, // sadece üretim dışında stack trace
    });
  };
  
  module.exports = errorHandler;
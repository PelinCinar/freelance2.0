const { logEvents } = require("./logEventsMiddleware.js");
const errorHandler = (err, req, res, next) => {
    // .dört parametreli bir middlewaredir ve uygulama içinde tek hatada express bizi buraya yönlendirir.
    const errorMessage = `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`;//Hata loglama mesajını oluşturuyoruz.
    
    logEvents(errorMessage, "errLog.log");//hata mesajlarımızı bir log dosyasında yazmak için kullanuyruzz log eventsiii
  
    console.error(err.stack);
  
    // Hata kodu belirleme
    const status = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(status);
  
    res.json({
      message: err.message, 
      stack: process.env.NODE_ENV === "production" ? null : err.stack, // sadece development ortamında gösterilir stack trace production da gizlenir
    });
  };
  
  module.exports = errorHandler;
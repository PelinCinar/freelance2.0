const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "dd.MM.yyyy\tHH.mm.ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // 'logs' klasörü yoksa oluşturuluyor
    const logsDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir);
    }

    // Log dosyasına mesaj ekleniyor
    await fsPromises.appendFile(path.join(logsDir, logFileName), logItem);
  } catch (error) {
    console.error("Log yazma hatası:", error);
  }
};

// Request loglama middleware (Güncellenmiş)
const logEventsMiddleware = (req, res, next) => {
  // response'dan önce loglama yapılacak
  const oldWrite = res.write;
  const oldEnd = res.end;

  // response'u geçici olarak değiştirmek için
  res.write = (...args) => {
    oldWrite.apply(res, args);
  };

  res.end = (...args) => {
    const message = `${req.method}\t${req.url}\t${req.headers.origin}\t${res.statusCode}`;

    // Sadece 2xx (başarılı) status kodu için loglama
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logEvents(message, "reqLog.log");
    }

    oldEnd.apply(res, args);
  };

  next();
};

module.exports = { logEvents, logEventsMiddleware };

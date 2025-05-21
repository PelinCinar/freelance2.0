const multer = require("multer");//dosya yüklemek için popüler middlewareğ
const path = require("path");

// multer'a dosyaları nereye ve nasıl kaydedileceğini söylüyoruz.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // klasörüne kaydediyoruz
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
//dosya uzantısını kontrol ediyoruzs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc|png|jpg|jpeg/;//kabul ettiğimiz uzantılar.
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());//dosya uzantısını küçük harfe çevirip aldırıyoruz.
  if (ext) cb(null, true);//dosya tipi uygunsa bu cb cart curtuyla kabul ediyoruz.
  else cb(new Error("Yalnızca PDF, DOC, PNG, JPG dosyaları yüklenebilir!"));
};

const upload = multer({ storage, fileFilter });//bu fonk. dosya yükleme işlemini yapacak bir özel middleware döndürüyor. instances

module.exports = upload;

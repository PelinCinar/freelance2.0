const { body } = require('express-validator');

const projectValidator = [
  // Title validation
  body('title')
    .notEmpty()
    .withMessage('Proje başlığı boş olamaz.')
    .isLength({ max: 100 })
    .withMessage('Proje başlığı en fazla 100 karakter olmalıdır.')
    .trim(),

  // Description validation
  body('description')
    .notEmpty()
    .withMessage('Proje açıklaması boş olamaz.')
    .isLength({ max: 500 })
    .withMessage('Proje açıklaması en fazla 500 karakter olmalıdır.')
    .trim(),

  // Budget validation
  body('budget')
    .notEmpty()
    .withMessage('Bütçe alanı boş olamaz.')
    .isFloat({ min: 0 })
    .withMessage('Bütçe geçerli bir rakam olmalıdır ve sıfırdan büyük olmalıdır.'),

  // Status validation (optional for creating projects)
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'completed', 'closed'])
    .withMessage('Geçersiz proje durumu.'),

  // Employer validation (to ensure employer ID is present in the request body)
  body('employer')
    .notEmpty()
    .withMessage('İşveren bilgisi eksik.')
    .isMongoId()
    .withMessage('Geçersiz işveren ID\'si.')
];

module.exports = projectValidator;

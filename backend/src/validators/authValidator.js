const userValidationRules = require("./userValidator");
const projectValidatorRules =require("./projectValidator.js")
//kullanıı kaydı için doğrulama kurallarını yazacağız.
const validateRegistration = [
  userValidationRules.email,
  userValidationRules.password,
  userValidationRules.name,
];

//kullancı giriş için gerekli doğrulama kurallını yazacğaız bu sefer

const validateLogin = [userValidationRules.email, userValidationRules.password];

const validateProjectCreation = [
  projectValidatorRules.title,
  projectValidatorRules.description,
  projectValidatorRules.budget,
  projectValidatorRules.status,
  projectValidatorRules.employer,
];

module.exports = { validateRegistration, validateLogin,validateProjectCreation };

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "Node E-Commerce API", 
      version: "1.0.0", 
      description: "API documentation for Node E-Commerce project", 
    },
    servers: [
      {
        url: "http://localhost:8080", // API'nin çalışacağı yerel server
        description: "Development server", 
      },
    ],
  },
  apis: ["./src/routes/*.js"], // routes klasöründeki tüm dosyalar taranacak
};

module.exports = swaggerJsdoc(options); 

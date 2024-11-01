import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Book Management System",
    version: "1.0.0",
  },
  servers: [
    { url: "http://localhost:3000", description: "Development Server" },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [path.resolve(__dirname, "../routes/*.mjs")], //why we need to do the absolute path ???
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

export { swaggerUi, swaggerSpec };

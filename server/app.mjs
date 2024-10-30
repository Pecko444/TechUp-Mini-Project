import express from "express";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from "./utils/swagger.mjs";
import booksRouter from "./routes/books.mjs";

dotenv.config({ path: "../.env" });

const app = express(); //create express object and assign to app
const port = process.env.PORT || 3000; //port that use for communication between Server and client

//start API
app.use(express.json()); // express.json = middleware that help reading JSON file / parsing

//Serve Swagger docs using swagger-ui-express
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/books", booksRouter);

//start server//
app.listen(port, () => {
  console.log(`server running at ${port}`);
});

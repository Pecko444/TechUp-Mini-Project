import express from "express";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from "./utils/swagger.mjs";
import booksRouter from "./routes/books.mjs";
import authRouter from "./routes/auth.mjs";
import cors from "cors";

dotenv.config({ path: "../.env" });

const app = express(); //create express object and assign to app
const port = process.env.PORT || 3000; //port that use for communication between Server and client
//Serve Swagger docs using swagger-ui-express
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//start API
app.use(express.json()); // express.json = middleware that help reading JSON file / parsing
app.use(cors()); //enable CORS for all routes
app.use("/books", booksRouter);
app.use("/register", authRouter);
app.use("/", authRouter); //for login

//start server//
app.listen(port, () => {
  console.log(`server running at ${port}`);
});

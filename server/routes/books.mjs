import Router from "express";
import connectionPool from "../utils/db.mjs";
import inputValidation, { bookValidation } from "../middlewares/validation.mjs";
import validateErrors from "../middlewares/errorHandling.mjs";

const booksRouter = Router();

//wait adding middlewares and will write swagger comment later
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book to the collection
 *     description: This endpoint allows users to add a new book to their collection with details like title and author.
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "To Kill a Mockingbird"
 *                 description: Title of the book
 *               author:
 *                 type: string
 *                 example: "Harper Lee"
 *                 description: Author of the book
 *     responses:
 *       201:
 *         description: Book successfully added to the collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "add book into collections !"
 *                 book:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "To Kill a Mockingbird"
 *                     author:
 *                       type: string
 *                       example: "Harper Lee"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-30T08:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-30T08:00:00Z"
 *       500:
 *         description: Server error due to database connection issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server could not add book into collection due to database's connection problem"
 *                 error:
 *                   type: string
 *                   example: "Database connection error message here"
 */

booksRouter.post("/", inputValidation, validateErrors, async (req, res) => {
  //get data from request
  const newBook = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };

  //connect to database and query
  try {
    await connectionPool.query(
      `INSERT INTO books (title, author, created_at, updated_at)
             VALUES ($1, $2, $3, $4)
            `,
      [newBook.title, newBook.author, newBook.created_at, newBook.updated_at]
    );
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not add book into collection due to database's connection problem",
      error: error.message,
    });
  }
  //return response
  return res.status(201).json({
    message: "add book into collections !",
    book: newBook,
  });
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve all books in the collection
 *     description: This endpoint retrieves all books from the user's collection.
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "To Kill a Mockingbird"
 *                       author:
 *                         type: string
 *                         example: "Harper Lee"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-30T08:00:00Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-30T08:00:00Z"
 *       500:
 *         description: Server error due to database connection issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server could not find the collection due to database connection problem"
 *                 error:
 *                   type: string
 *                   example: "Database connection error message here"
 */

booksRouter.get("/", async (req, res) => {
  //connect to database and query
  try {
    const result = await connectionPool.query(`SELECT * FROM books`);
    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not find the collection due to database connection problem",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /books/{bookid}:
 *   get:
 *     summary: Retrieve a book by its ID
 *     description: This endpoint retrieves a specific book from the collection based on the provided book ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "To Kill a Mockingbird"
 *                     author:
 *                       type: string
 *                       example: "Harper Lee"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-30T08:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-30T08:00:00Z"
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "bookid: {bookid} not found"
 *       500:
 *         description: Server error due to database connection issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server could not get the book due to database connection problem"
 *                 error:
 *                   type: string
 *                   example: "Database connection error message here"
 */

booksRouter.get(
  "/:bookid",
  bookValidation,
  validateErrors,
  async (req, res) => {
    //get parameter from client
    const bookidFromClient = req.params.bookid;
    //connect to database and query
    try {
      const result = await connectionPool.query(
        `SELECT * FROM books WHERE bookid = $1`,
        [bookidFromClient]
      );
      //check if can find bookid or no
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: `bookid: ${bookidFromClient} not found` });
      }

      return res.status(200).json({
        data: result.rows[0],
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Server cound not get the book due to database connection problem",
        error: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /books/{bookid}:
 *   put:
 *     summary: Update a book by its ID
 *     description: This endpoint updates the details of a specific book in the collection based on the provided book ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "1984"
 *                 description: The updated title of the book
 *               author:
 *                 type: string
 *                 example: "George Orwell"
 *                 description: The updated author of the book
 *     responses:
 *       200:
 *         description: Book successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "update book successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "1984"
 *                     author:
 *                       type: string
 *                       example: "George Orwell"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-30T08:00:00Z"
 *       500:
 *         description: Server error due to database connection issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server could not update book due to database connection problem"
 */

booksRouter.put(
  "/:bookid",
  inputValidation,
  bookValidation,
  validateErrors,
  async (req, res) => {
    //get client parameter and assign req.body to variable
    const bookidFromClient = req.params.bookid;
    const updateBook = req.body;

    //connect to database and query
    try {
      const result = await connectionPool.query(
        `
        UPDATE books
        SET
          title = $1,
          author = $2,
          updated_at = NOW()
        WHERE
          bookid = $3
        RETURNING *
      `,
        [updateBook.title, updateBook.author, bookidFromClient]
      );

      return res.status(200).json({
        message: "update book successfully",
        data: result.rows[0],
      });
    } catch (erorr) {
      return res.status(500).json({
        message:
          "Server cound not update book due to database connection problem",
      });
    }
  }
);

/**
 * @swagger
 * /books/{bookid}:
 *   delete:
 *     summary: Delete a book by its ID
 *     description: This endpoint deletes a specific book from the collection based on the provided book ID.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to delete
 *     responses:
 *       200:
 *         description: Book successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete book successfully!"
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "bookid: {bookid} not found"
 *       500:
 *         description: Server error due to database connection issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server could not delete book due to database connection problem"
 *                 error:
 *                   type: string
 *                   example: "Database connection error message here"
 */

booksRouter.delete(
  "/:bookid",
  bookValidation,
  validateErrors,
  async (req, res) => {
    //get client parameter
    const bookidFromClient = req.params.bookid;
    console.log(bookidFromClient);
    //connect to database and query
    try {
      const result = await connectionPool.query(
        `
        DELETE FROM books WHERE bookid = $1
      `,
        [bookidFromClient]
      );
      //check if can find bookid or no
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: `bookid: ${bookidFromClient} not found` });
      }
    } catch (error) {
      return res.status(500).json({
        message:
          "Server could not delete book due to database connection problem",
        error: error.message,
      });
    }
    //return response
    return res.status(200).json({ message: "Delete book successfully !" });
  }
);

export default booksRouter;

import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { registerValidation } from "../middlewares/validation.mjs";
import validateErrors from "../middlewares/errorHandling.mjs";
import { loginValidation } from "../middlewares/validation.mjs";

dotenv.config();
const authRouter = Router();
//register

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint registers a new user by providing required fields such as username, password, email, first name, and last name.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *                 description: The first name of the user
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *                 description: The last name of the user
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *                 description: Unique username for the user
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: User's password
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *                 description: User's email address
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *       409:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "username or email already exists"
 *       500:
 *         description: Server error during registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "error registering user"
 *                 error:
 *                   type: string
 *                   example: "Database connection error message here"
 */

authRouter.post("/", registerValidation, validateErrors, async (req, res) => {
  //Destruct and assign variable to the same name
  const { first_name, last_name, username, password, email } = req.body;
  //Encapsulate wrapping into one variable
  const user = { username, password, email, first_name, last_name };
  try {
    //Check if username already exists
    const usernameExists = await connectionPool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );
    //If username already exists, return error
    if (usernameExists.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "username or email already exists" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    //set password to hash-password
    const hashPassword = await bcrypt.hash(password, salt);

    //Insert user into database
    const result = await connectionPool.query(
      `INSERT INTO users (first_name, last_name, username, password_hash, email) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.first_name, user.last_name, user.username, hashPassword, user.email]
    );
    //Return success message
    res.status(201).json({
      message: "User created successfully",
      data: {
        user_id: result.rows[0].user_id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
      },
    });
  } catch (error) {
    //Return error message
    res
      .status(500)
      .json({ message: "error registering user", error: error.message });
  }
});

//login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: This endpoint allows a registered user to log in by providing a valid username and password. Upon successful login, a JWT token is returned.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *                 description: The username of the user
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "JWT_TOKEN_HERE"
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *       401:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error during login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error logging in"
 *                 error:
 *                   type: string
 *                   example: "Database connection error message here"
 */

authRouter.post("/login", loginValidation, validateErrors, async (req, res) => {
  //get username and password from request body
  const { username, password } = req.body;

  try {
    //check if username exists
    const user = await connectionPool.query(
      `
      SELECT * FROM users WHERE username = $1
      `,
      [username]
    );

    console.log(user.rows[0].password_hash);

    //if username does not exist, return error
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    //compare password with hash password
    const isValidPassword = await bcrypt.compare(
      password, //password from req.body
      user.rows[0].password_hash //password from database
    );

    //error handling when password not valid
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //generate JWT token
    const token = jwt.sign(
      {
        userId: user.rows[0].user_id,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    //return success message
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.rows[0].user_id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
      },
    });
  } catch (error) {
    //log in error
    //check logger
    //logger.error("Error logging in:", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

export default authRouter;

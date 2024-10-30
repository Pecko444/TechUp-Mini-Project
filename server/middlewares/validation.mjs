import { body, param } from "express-validator";

//post validation
const inputValidation = [
  body("title")
    //sanitize
    .trim()
    .escape() //prevent cross-site-scripting (XSS) --> bigger project should add more package about security
    //validate
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be string")
    .isLength({ max: 150 })
    .withMessage("Title must not exceed 150 charactors long"),
  body("author")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Author is required")
    .isString()
    .withMessage("Author must be string")
    .isLength({ max: 150 })
    .withMessage("Author must not exceed 150 charactors long"),
];

export const bookValidation = [
  param("bookid")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("bookid is required")
    .isInt({ min: 1 })
    .withMessage("bookid must be positive integer"),
];
//query parameter
//login validation

export default inputValidation;

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

export const registerValidation = [
  //username validate
  body("username")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("username must be between 3 and 20 characters long"),

  //email validate
  body("email")
    .trim()
    .normalizeEmail() //convert email to lowercase and remove extra spaces
    .isEmail()
    .withMessage("Email address is not valid")
    .notEmpty()
    .withMessage("Email address is required"),

  //password validate
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%&?*]/)
    .withMessage("Password must contain at least one special character"),
];
//login validation
export const loginValidation = [
  body("username")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("username is required")
    .isString()
    .withMessage("username must be string"),
  body("password")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("password is required")
    .isString()
    .withMessage("password must be string"),
];

//comfirm password validate this's for register
/* body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }), */

export default inputValidation;

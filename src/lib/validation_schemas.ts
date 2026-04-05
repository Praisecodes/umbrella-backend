import { object, string } from "yup";

export const SIGNUP_SCHEMA = object({
  email: string()
    .required("Please enter your email address")
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/, {
      message: "Enter a valid email address"
    }),
  password: string()
    .required("Please enter your password")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, {
      message: "Your password must be at least 6 character long and contain at least 1 digit, 1 uppercase and one lowercase letter"
    }),
  username: string()
    .required("Please enter your username"),
  firstName: string()
    .required("Please enter your first name"),
  lastName: string()
    .required("Please enter your last name"),
});

export const LOGIN_SCHEMA = object({
  email: string()
    .required("Please enter your email address")
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/, {
      message: "Enter a valid email address"
    }),
  password: string()
    .required("Please enter your password"),
});
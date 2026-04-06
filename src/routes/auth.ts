import express, { Response, Request } from 'express';
import { Prisma } from '../lib';
import { InferType, ValidationError } from 'yup';
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from '../lib/validation_schemas';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOTP, sendEmail, sendResponse } from '../lib/utils';

const AuthRouter = express.Router();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

AuthRouter.post('/signup', async (req: Request, res: Response) => {
  const payload: InferType<typeof SIGNUP_SCHEMA> = { ...req.body };

  try {
    await SIGNUP_SCHEMA.validate(payload, { abortEarly: false });
    const { password, ...rest } = payload;

    const existingUser = await Prisma.users.findFirst({
      where: {
        email: rest.email
      }
    });

    if (!!existingUser) {
      return sendResponse(409, res, "Conflict", ["User already exists, please login!"]);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let message = ""

    try {
      const user = await Prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            ...rest,
            password: passwordHash
          }
        });

        const otp = await generateOTP();

        await tx.otps.create({
          data: {
            ...otp,
            userId: newUser.id,
          }
        });

        message = `Hello, ${newUser.firstName} ${newUser.lastName}! Verify your email using the code below:\n${otp.otp}.\nThis code is valid for only 15 minutes`;

        return newUser;
      });

      await sendEmail(user.email, "Welcome To Umbrella App", message);

      return sendResponse(201,
        res,
        "Account created successfully\nAn OTP was sent to your email. Please enter OTP to verify your email",
        null
      );
    } catch (error) {
      console.log(`Error creating user is (${req.url}):`, error);
      return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      console.log("Signup Error:", JSON.stringify(error, null, 2));
      return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
    }
  }
});

AuthRouter.post('/login', async (req: Request, res: Response) => {
  const payload: InferType<typeof LOGIN_SCHEMA> = { ...req.body };

  try {
    await LOGIN_SCHEMA.validate(payload, { abortEarly: false });

    try {
      const user = await Prisma.users.findFirst({
        where: {
          email: payload.email
        }
      });

      if (!user) {
        return sendResponse(404, res, "Invalid Credentials", null, ["Invalid credentials"]);
      }

      console.log("User Found:", JSON.stringify(user, null, 2));

      const passwordIsValid = await bcrypt.compare(payload.password, user.password);

      if (!passwordIsValid) {
        return sendResponse(401, res, "Invalid Credentials", null, ["Invalid credentials"]);
      }

      const jwtSecret = process.env.JWT_SECRET || ""

      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "7d" });

      const { password, ...rest } = user;

      return sendResponse(200, res, "Success", { user: { ...rest }, token });
    } catch (error) {
      console.log("Error is:", error);
      return sendResponse(500, res, "Error logging you in", null, [error as any]);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      console.log("Login Error:", JSON.stringify(error, null, 2));
      return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
    }
  }
});

export default AuthRouter;

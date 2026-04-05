import express, { Response, Request } from 'express';
import { Prisma } from '../lib';
import { InferType, ValidationError } from 'yup';
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from '../lib/validation_schemas';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../lib/utils';

const AuthRouter = express.Router();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

AuthRouter.post('/signup', async (req: Request, res: Response) => {
  const payload: InferType<typeof SIGNUP_SCHEMA> = { ...req.body };

  try {
    await SIGNUP_SCHEMA.validate(payload, { abortEarly: false });

    const { password, ...rest } = payload;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const user = await Prisma.users.create({
        data: {
          ...rest,
          password: passwordHash
        }
      });

      const jwt_secret = process.env.JWT_SECRET || "";

      const token = jwt.sign({ id: user.id }, jwt_secret, { expiresIn: "7d" });

      return sendResponse(201, res, "User created successfully", { user, token });
    } catch (error) {
      console.log(`Error creating user is (${req.url}):`, error);
      return sendResponse(500, res, "Internal Server Error", null, ["Internal Server Error"]);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      return sendResponse(500, res, "Internal Server Error", null, ["Internal Server Error"]);
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

      return sendResponse(200, res, "Success", { user, token });
    } catch (error) {
      console.log("Error is:", error);
      return sendResponse(500, res, "Error logging you in", null, [error as any]);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      return sendResponse(500, res, "Internal Server Error", null, ["Internal Server Error"]);
    }
  }
});

export default AuthRouter;

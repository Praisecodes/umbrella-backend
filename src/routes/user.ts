import express, { Request, Response } from 'express';
import { string, ValidationError } from 'yup';
import { sendResponse } from '../lib/utils';
import { Prisma } from '../lib';

const UserRouter = express.Router();

UserRouter.delete('/', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    await string()
      .required("Enter the email of the user")
      .email("Enter a valid email address")
      .validate(email, { abortEarly: false });

    const user = await Prisma.users.findUnique({ where: { email } });

    if (!user) {
      return sendResponse(404, res, "User not found", null, ["User not found"]);
    }

    await Prisma.users.delete({
      where: {
        id: user.id
      }
    });

    return sendResponse(200, res, "Successfully deleted user", null);
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      console.log("Error is:", JSON.stringify(error, null, 2));
      return sendResponse(500, res, "Internal Server Error", ["Internal Server Error"]);
    }
  }
});

export default UserRouter;

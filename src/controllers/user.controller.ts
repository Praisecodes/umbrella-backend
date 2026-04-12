import { Request, Response } from "express";
import { Prisma } from "../lib";
import { sendResponse } from "../lib/utils";
import jwt from 'jsonwebtoken';

export const deleteUserController = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const user = await Prisma.users.findUnique({ where: { id: userId } });

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
    console.log("Error is:", JSON.stringify(error, null, 2));
    return sendResponse(500, res, "Internal Server Error", ["Internal Server Error"]);
  }
}

export const getSession = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const user = await Prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return sendResponse(404, res, "User Not Found", null, ["User Not Found"]);
    }

    const { password, ...rest } = user;
    const JWT_SECRET = process.env.JWT_SECRET || "";

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return sendResponse(200, res, "Session Restored Successfully", { user: { ...rest }, token });
  } catch (error) {
    console.log("Error is:", JSON.stringify(error, null, 2));
    return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
  }
}

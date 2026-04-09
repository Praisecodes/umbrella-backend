import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../lib/utils";
import jwt from "jsonwebtoken";

const AuthMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-umbrella-access"] as string;

  if (!token) {
    return sendResponse(401, res, "Unauthenticated", null, ["Unathenticated"]);
  }

  const JWT_SECRET = process.env.JWT_SECRET || "";

  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

  (req as any).userId = decoded?.id ?? "";
  next();
}

export default AuthMiddleWare;

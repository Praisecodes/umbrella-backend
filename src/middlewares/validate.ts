import { AnySchema, ValidationError } from "yup";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../lib/utils";

export const validate = (schema: AnySchema) => (
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return sendResponse(400, res, "Validation Error", err.errors);
      } else {
        console.log("Error is:", JSON.stringify(err, null, 2));
        return sendResponse(500, res, "Internal Server Error", ["Something went wrong"]);
      }
    }
  }
);

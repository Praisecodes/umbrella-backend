import { Response } from "express";

const sendResponse = async (statusCode: number, response: Response, message: string, data: object | null, errors?: string[]) => {
  return response
    .status(statusCode)
    .json({
      statusCode,
      message,
      data,
      ...(!!errors && ({ errors })),
    });
}

export {
  sendResponse,
}
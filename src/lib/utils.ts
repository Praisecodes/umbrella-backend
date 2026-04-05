import { Response } from "express";
import Prisma from "./prisma";
import { addMinutes } from "date-fns";
import nodemailer from 'nodemailer';

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

const generateOTP = async (): Promise<{ otp: string, validTill: string }> => {
  const MAX_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const existingOtp = await Prisma.otps.findFirst({
      where: {
        otp,
        deletedAt: null,
        validTill: {
          gt: new Date()
        }
      }
    });

    if (!existingOtp) {
      return { otp, validTill: addMinutes(new Date(), 15).toISOString() };
    }
  }

  // fallback (very unlikely)
  throw new Error("Unable to generate unique OTP after multiple attempts");
}

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
  });

  await transporter.sendMail({
    from: `"Umbrella App" <${process.env.EMAIL_USER || ""}>`,
    to,
    subject,
    html,
  });
};

export {
  sendResponse,
  generateOTP,
  sendEmail
}

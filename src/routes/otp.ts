import express, { Request, Response } from 'express';
import { ValidationError } from 'yup';
import { generateOTP, sendEmail, sendResponse } from '../lib/utils';
import { REQUEST_OTP_SCHEMA, VERIFY_OTP_SCHEMA } from '../lib/validation_schemas';
import { Prisma } from '../lib';
import { differenceInMinutes } from 'date-fns';
import jwt from 'jsonwebtoken';

const OtpRouter = express.Router();

OtpRouter.post('/request', async (req: Request, res: Response) => {
  const payload = req.body;   // Get email from payload

  // Validate payload (email) to ensure that the correct payload is being sent
  try {
    await REQUEST_OTP_SCHEMA.validate(payload, { abortEarly: false });
    const { email } = payload;

    // Check if there's a user with the email address on the system already.
    const user = await Prisma.users.findUnique({
      where: { email }
    });

    // If no user exists, throw an early 200 success with a message.
    if (!user) {
      return sendResponse(200, res, `Request success! If your email exists on our platform, you'll receive an OTP in your inbox`, null);
    }

    /**
     * If there's a user, check if there's an OTP already active for that user.
     * If there is, send that same OTP again with the time left for the OTP to expire.
     * Else, generate a new OTP and send that instead.
     */
    const otp = await Prisma.otps.findMany({
      where: {
        user,
        deletedAt: null,
        validTill: {
          gt: new Date()
        },
      },
      orderBy: {
        validTill: 'desc'
      }
    });


    if (otp.length >= 1) {
      const currentOTP = otp[0];
      const message = `Kindly enter this OTP to continue your operation:\n
      ${currentOTP.otp}\n\n
      NOTE: This OTP is only valid for ${differenceInMinutes(currentOTP.validTill, new Date())} minutes`;

      await sendEmail(user.email, "OTP", message);
    } else {
      const OTP = await generateOTP();
      const message = `Kindly enter this OTP to continue your operation:\n
      ${OTP.otp}\n\n
      NOTE: This OTP is only valid for 15 minutes`;

      await sendEmail(user.email, "OTP", message);
    }

    return sendResponse(
      200,
      res,
      `Request success! If your email exists on our platform, you'll receive an OTP in your inbox`,
      null
    );
  } catch (error) {
    /**
     * If the payload validation fails, throw a 409 error.
     * Else, throw a 500 error and log the error.
     */
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      console.log("Error is:", JSON.stringify(error, null, 2));
      return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
    }
  }
});

OtpRouter.post('/verify', async (req: Request, res: Response) => {
  const payload = req.body;

  try {
    await VERIFY_OTP_SCHEMA.validate(payload, { abortEarly: false });

    const { email, otp } = payload;

    const user = await Prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return sendResponse(404, res, "Email not found", null, ["Sorry, we couldn't verify your email address"]);
    }

    const OTP = await Prisma.otps.findFirst({
      where: {
        deletedAt: null,
        user,
        otp,
        validTill: {
          gt: new Date()
        }
      }
    });

    if (!OTP) {
      return sendResponse(400, res, "Invalid OTP Code", null, ["Invalid OTP Code"]);
    }

    const updatedUser = await Prisma.$transaction(async (tx) => {
      const userUpdate = await tx.users.update({
        data: {
          emailVerified: true
        },
        where: {
          id: user.id
        }
      });

      await tx.otps.update({
        data: {
          deletedAt: new Date()
        },
        where: {
          id: OTP.id
        }
      });

      return userUpdate;
    });

    const JWT_SECRET = process.env.JWT_SECRET || "";

    const token = jwt.sign({ id: updatedUser.id }, JWT_SECRET, { expiresIn: "7d" });

    const { password, ...rest } = updatedUser;

    return sendResponse(
      200,
      res,
      "You've successfully verified your email",
      { user: { ...rest }, token }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendResponse(409, res, "Validation Error", null, error.errors);
    } else {
      console.log("Error is:", JSON.stringify(error, null, 2));
      return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
    }
  }
});

export default OtpRouter;

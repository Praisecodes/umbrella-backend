import express from 'express';
import { requestOtpController, verifyOtpController } from '../controllers/otp.controller';

const OtpRouter = express.Router();

OtpRouter.post('/request', requestOtpController);

OtpRouter.post('/verify', verifyOtpController);

export default OtpRouter;

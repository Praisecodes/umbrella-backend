import express from 'express';
import { loginController, resetPasswordController, signupController } from '../controllers/auth.controller';

const AuthRouter = express.Router();

AuthRouter.post('/signup', signupController);

AuthRouter.post('/login', loginController);

AuthRouter.post('/reset-password', resetPasswordController);

export default AuthRouter;

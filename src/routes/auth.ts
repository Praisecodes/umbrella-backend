import express from 'express';
import { loginController, signupController } from '../controllers/auth.controller';

const AuthRouter = express.Router();

AuthRouter.post('/signup', signupController);

AuthRouter.post('/login', loginController);

export default AuthRouter;

import express from 'express';
import { deleteUserController, getSession } from '../controllers/user.controller';

const UserRouter = express.Router();

UserRouter.delete('/', deleteUserController);
UserRouter.get('/getSession', getSession);

export default UserRouter;

import express from 'express';
import { deleteUserController } from '../controllers/user.controller';

const UserRouter = express.Router();

UserRouter.delete('/', deleteUserController);

export default UserRouter;

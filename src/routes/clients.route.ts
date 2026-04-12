import express from 'express';
import { createClient, deleteClient, getAllClients, getClient, updateClient } from '../controllers/clients.controller';
import { validationMiddleware } from '../middlewares/validate';
import { SIGNUP_SCHEMA } from '../lib/validation_schemas';

const ClientsRouter = express.Router();

ClientsRouter.post('/', validationMiddleware(SIGNUP_SCHEMA), createClient);

ClientsRouter.get('/', getAllClients);

ClientsRouter.get('/:id', getClient);

ClientsRouter.patch('/update/:id', updateClient);

ClientsRouter.delete('/', deleteClient);

export default ClientsRouter;

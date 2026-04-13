import express from 'express';
import { createClient, deleteClient, getAllClients, getClient, updateClient } from '../controllers/clients.controller';
import { validationMiddleware } from '../middlewares/validate';
import { CREATE_CLIENT_SCHEMA, UPDATE_CLIENT_SCHEMA } from '../lib/validation_schemas';

const ClientsRouter = express.Router();

ClientsRouter.post('/', validationMiddleware(CREATE_CLIENT_SCHEMA), createClient);

ClientsRouter.get('/', getAllClients);

ClientsRouter.get('/:id', getClient);

ClientsRouter.patch('/update/:id', validationMiddleware(UPDATE_CLIENT_SCHEMA), updateClient);

ClientsRouter.delete('/', deleteClient);

export default ClientsRouter;

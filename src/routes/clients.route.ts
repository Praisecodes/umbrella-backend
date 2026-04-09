import express from 'express';
import { createClient, deleteClient, getAllClients, getClient, updateClient } from '../controllers/clients.controller';

const ClientsRouter = express.Router();

ClientsRouter.post('/', createClient);

ClientsRouter.get('/', getAllClients);

ClientsRouter.get('/:id', getClient);

ClientsRouter.patch('/update/:id', updateClient);

ClientsRouter.delete('/', deleteClient);

export default ClientsRouter;

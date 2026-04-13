import { Request, Response } from "express";
import { sendResponse } from "../lib/utils";
import { Prisma } from "../lib";
import { InferType } from "yup";
import { CREATE_CLIENT_SCHEMA, UPDATE_CLIENT_SCHEMA } from "../lib/validation_schemas";

export const createClient = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const payload: InferType<typeof CREATE_CLIENT_SCHEMA> = req.body;

  try {
    const user = await Prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return sendResponse(404, res, "User Not Found", null, ["User Not Found"]);
    }

    const client = await Prisma.clients.create({
      data: {
        ...payload,
        userId: user.id
      },
      include: {
        platforms: true
      }
    });

    return sendResponse(200, res, "Client Created Successfully", { client });
  } catch (error) {
    return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
  }
}

export const getAllClients = async (req: Request, res: Response) => {
  console.log("User ID:", (req as any).userId);
  const userId = (req as any).userId;

  try {
    const user = await Prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log(`Error (${req.url}):`, "User does not exist");
      return sendResponse(401, res, "Unauthenticated", null, ["Unauthenticated"]);
    }

    const clients = await Prisma.clients.findMany({
      where: {
        user
      }
    });

    return sendResponse(200, res, "Clients fetched succesfully", { clients });
  } catch (error) {
    console.log(`Error is (${req.url}):`, JSON.stringify(error, null, 2));
    return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
  }
}

export const getClient = async (req: Request, res: Response) => {
  const { clientId } = req.params;

  try {
    const client = await Prisma.clients.findUnique({
      where: { id: clientId as string },
      include: {
        platforms: true,
      }
    });

    if (!client) {
      return sendResponse(404, res, "Client Not Found", null, ["We couldn't find the requested client"]);
    }

    return sendResponse(200, res, "Client fetched successfully", { client });
  } catch (error) {
    console.log(`Error is (${req.url}):`, JSON.stringify(error, null, 2));
    return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
  }
}

export const updateClient = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const payload: InferType<typeof UPDATE_CLIENT_SCHEMA> = req.body;

  try {
    const user = await Prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return sendResponse(404, res, "User Not Found", null, ["User not found"]);
    }

    const updatedClient = await Prisma.clients.update({
      data: payload,
      where: {
        id: ""
      },
      include: {
        platforms: true
      }
    });

    return sendResponse(200, res, "Successfully Updated Client", { client: updatedClient });
  } catch (error) {
    console.log(`Error is (${req.url}):`, JSON.stringify(error, null, 2));
    return sendResponse(500, res, "Internal Server Error", null, ["Something went wrong"]);
  }
}

export const deleteClient = async (req: Request, res: Response) => {
}

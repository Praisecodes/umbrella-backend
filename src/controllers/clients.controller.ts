import { Request, Response } from "express";
import { sendResponse } from "../lib/utils";
import { Prisma } from "../lib";

export const createClient = async (req: Request, res: Response) => {
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
}

export const deleteClient = async (req: Request, res: Response) => {
}

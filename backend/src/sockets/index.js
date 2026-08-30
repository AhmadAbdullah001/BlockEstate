import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";

export function initializeSockets(httpServer) {
  const io = new Server(httpServer, { cors: corsOptions });
  return io;
}

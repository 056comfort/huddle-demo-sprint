import dotenv from "dotenv";
import http from "http";

import app from "./app";
import { initializeSocket } from "./socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(
    `Huddle server running on port ${PORT}`
  );
});
import dotenv from 'dotenv';
import http from "http";

import app from './app.js';
import connectDB from './config/db.js';
import { initialiseSocket } from './socket/socket.js';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initialiseSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initialiseSocket = (server) => {
    io = new Server(server,{
        cors:{
            origin:"*",
            credentials:true,
        },
    });

    io.use(async(socket,next) =>{
        try{
            const token = socket.handshake.auth.token;
            if(!token) {
               return next(new Error("Authentication Token not found"));
            }

            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();

        } catch(error) {
            next(new Error("Authentication failed."));
        }
    });

    io.on("connection",(socket) =>{
        console.log(`User${socket.userId} connected`);
        socket.join(socket.userId);

        socket.on("disconnect",()=>{
            console.log(`User${socket.userId} disconnected`);
        });
    });
    return io;
};

export const getIO =() =>{
     if (!io) {
        throw new Error("Socket.io is not initialized.");
    }
    return io;
};
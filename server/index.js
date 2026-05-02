

import express from "express";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import interviewRoutes from './routes/interviewRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import counslerRoutes from "./routes/counsellorRoutes.js"; 
import { Message } from './models/Message.js';
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import exploreCollegeRoutes from "./routes/exploreCollegeRoutes.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://career-counselling-vqqc.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });

    socket.on('offer', (offer, room, senderId) => {
      socket.to(room).emit('offer', offer, senderId);
    });

    socket.on('answer', (answer, room, senderId) => {
      socket.to(room).emit('answer', answer, senderId);
    });

    socket.on('ice-candidate', (candidate, room, senderId) => {
      socket.to(room).emit('ice-candidate', candidate, senderId);
    });
  });

  socket.on('join-chat', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal chat room`);
  });

  socket.on('send-message', async (data) => {
    try {
      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
        isRead: false
      });
      await newMessage.save();

      const populatedMessage = await newMessage.populate('sender', 'name email role');

      socket.to(data.receiver).emit('receive-message', populatedMessage);

      socket.emit('message-sent', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
});

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.options("*", cors());

app.use("/api/users", userRoutes); 
app.use("/api/counsellors", counslerRoutes); 
app.use("/api/college", exploreCollegeRoutes); 
app.use('/api/interviews', interviewRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the .env file.");
}

const ai = new GoogleGenAI({});

     const main = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}`,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, 
      },
    }
  });
  console.log(response.text);
  return(response.text);

}
export default main;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Server running   ooon port ${PORT}`));

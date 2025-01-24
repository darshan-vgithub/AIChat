import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ImageKit from "imagekit";
import UserChats from "./models/userChats.js";
import Chat from "./models/chat.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5173/",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

// ImageKit initialization
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/test", ClerkExpressRequireAuth(), (req, res) => {
  console.log("success");
  res.send("Success!!!!");
});

// ImageKit upload authentication endpoint
app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// API to handle chat creation
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const { userId, text } = req.body;

  // Validate request body
  if (!userId || !text) {
    return res.status(400).send("userId and text are required");
  }

  try {
    // Create a new chat document
    const newChat = new Chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    // Check if the user's chats already exist
    const userChats = await UserChats.findOne({ userId });

    if (!userChats) {
      // If no chats exist for the user, create a new userChats document
      const newUserChats = new UserChats({
        userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });

      await newUserChats.save();
    } else {
      // If userChats exists, add the new chat to the chats array
      await UserChats.updateOne(
        { userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
    }

    res.status(201).send({ chatId: savedChat._id });
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).send("Error creating chat");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated");
});
// Start the server
app.listen(port, () => {
  connectToMongoDB();
  console.log(`Server is listening on port ${port}`);
});

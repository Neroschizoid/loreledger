require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/message");

connectDB();

const port = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // When a user joins a story room
    socket.on("join_story", (storyId) => {
        socket.join(storyId);
        console.log(`User ${socket.id} joined story room: ${storyId}`);
    });

    // When a user sends a message
    socket.on("send_message", async (data) => {
        try {
            const { storyId, senderId, content } = data;

            // Persist the message
            const newMessage = await Message.create({
                storyId,
                senderId,
                content
            });

            // Populate sender info for the client display (optional but good idea)
            await newMessage.populate("senderId", "username");

            // Broadcast to everyone in the room (including sender)
            io.to(storyId).emit("receive_message", newMessage);
        } catch (error) {
            console.error("Socket send_message error:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`server running on port ${port}`);
})

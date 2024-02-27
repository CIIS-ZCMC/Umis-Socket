require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const port = process.env.SERVER_PORT;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ORIGIN_URL, // Replace with your client's origin
    methods: ["GET", "POST"], // Add allowed HTTP methodsc
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("new-division", () => {
    console.log("New division");
    if (socket) {
      // Broadcast the "new-division" event to all clients except the one that triggered it
      socket.broadcast.emit("new-division");
    } else {
      console.log("Socket is undefined");
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

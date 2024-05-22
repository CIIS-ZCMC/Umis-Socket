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

  socket.on("division", (data) => {
    if (socket) {
      socket.broadcast.emit("division", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("department", (data) => {
    if (socket) {
      socket.broadcast.emit("department", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("section", (data) => {
    if (socket) {
      socket.broadcast.emit("section", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("unit", (data) => {
    if (socket) {
      socket.broadcast.emit("unit", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("designation", (data) => {
    if (socket) {
      socket.broadcast.emit("designation", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("plantilla", (data) => {
    if (socket) {
      socket.broadcast.emit("plantilla", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  // Leave application and request
  socket.on("leave-request", (data) => {
    if (socket) {
      socket.broadcast.emit("leave-request", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  // Update request
  socket.on("update-request", (data) => {
    if (socket) {
      socket.broadcast.emit("update-request", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //Official business
  socket.on("official-business-request", (data) => {
    if (socket) {
      socket.broadcast.emit("official-business-request", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //Official time
  socket.on("official-time-request", (data) => {
    if (socket) {
      socket.broadcast.emit("official-time-request", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //cto
  socket.on("cto-request", (data) => {
    if (socket) {
      socket.broadcast.emit("cto-request", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //cto
  socket.on("mone-request", (data) => {
    if (socket) {
      socket.broadcast.emit("mone-request", data);
      socket.broadcast.emit("sidebarnotification", data);
    } else {
      console.log("Socket is undefined");
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

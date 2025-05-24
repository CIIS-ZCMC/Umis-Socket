require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

/** Models */
// const Biolog = require("./models/Biolog");

const port = process.env.SERVER_PORT ?? 3025;
const app = express();
const server = http.createServer(app);

let globalIO;
let messageQueue = [];

const io = socketIo(server, {
  cors: {
    origin: [
      process.env.PNRS_CLIENT,
      process.env.PNRS_SERVER,
      process.env.ORIGIN_PORTAL_CLIENT,
      process.env.ORIGIN_PR_MONITORING_CLIENT,
      process.env.ORIGIN_PR_MONITORING_SERVER,
      process.env.ORIGIN_SERVER,
    ], // Replace with your client's origin
    methods: ["GET", "POST"], // Add allowed HTTP methodsc
    credentials: true,
  },
});

const corsOptions = {
  origin: [process.env.ORIGIN_CLIENT, process.env.ORIGIN_SERVER],
  methods: ["GET", "POST"],
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

io.on("connection", (socket) => {
  console.log("A user connected");
  globalIO = io;

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // FREEDOM WALL
  socket.on("freedom-wall", (data) => {
    if (socket) {
      socket.broadcast.emit("freedom-wall", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  // AREAS
  socket.on("division", (data) => {
    if (socket) {
      socket.broadcast.emit("division", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("department", (data) => {
    if (socket) {
      socket.broadcast.emit("department", data);
      console.log("Sending love on department module.");
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("section", (data) => {
    if (socket) {
      socket.broadcast.emit("section", data);
      console.log("Sending love on section module.");
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("unit", (data) => {
    if (socket) {
      socket.broadcast.emit("unit", data);
      console.log("Sending love on unit module.");
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("designation", (data) => {
    if (socket) {
      socket.broadcast.emit("designation", data);
      console.log("Sending love on designation module.");
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("plantilla", (data) => {
    if (socket) {
      socket.broadcast.emit("plantilla", data);
      console.log("Sending love on plantilla module.");
    } else {
      console.log("Socket is undefined");
    }
  });

  // Leave application and request
  socket.on("leave-request", (data) => {
    if (socket) {
      socket.broadcast.emit("leave-request", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  // Update request
  socket.on("update-request", (data) => {
    if (socket) {
      socket.broadcast.emit("update-request", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //Official business
  socket.on("official-business-request", (data) => {
    if (socket) {
      socket.broadcast.emit("official-business-request", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //Official time
  socket.on("official-time-request", (data) => {
    if (socket) {
      socket.broadcast.emit("official-time-request", data);
    } else {
      console.log("Socket is undefined");
    }
  });

  //cto
  socket.on("cto-request", (data) => {
    if (socket) {
      socket.broadcast.emit("cto-request", data);
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

  while (messageQueue.length > 0) {
    console.log("Queue Task Trigered.");
    const queuedMessage = messageQueue.shift();
    globalIO.emit(queuedMessage.event, queuedMessage.data);
  }

  socket.on("disconnect", () => {
    // console.log("A user disconnected: " + socket.id);
  });
});

app.post("/notification", (req, res) => {
  const body = req.body;

  if (globalIO) {
    globalIO.emit(`notifications-${body.id}`, body.data);
    console.log(body);
    res.status(200).send("Message triggered successfully");
  } else {
    console.log("Socket connection not established yet. Queuing message...");
    messageQueue.push({ event: "notifications", data: body });
    res.status(200).send("Message queued successfully");
  }
});

// PR MONITORING END POINT
app.post("/pr-monitoring", (req, res) => {
  const body = req.body;
  console.log("DATA RECEIVE FROM PR: ", body);

  if (globalIO) {
    // Target socket event
    const event = body.data.event;

    // Data to be sent to all listener
    const data = body.data.data;

    globalIO.emit("transaction", data);

    res.status(200).send("Message triggered successfully");
  } else {
    console.log("Socket connection not established yet. Queuing message...");
    messageQueue.push({ event: "notifications", data: body });
    res.status(200).send("Message queued successfully");
  }
});

// PR MONITORING END POINT
app.post("/pnrs-notifications", (req, res) => {
  const body = req.body;
  console.log("DATA RECEIVE FROM PNRS: ", body);

  if (globalIO) {
    // Target socket event
    const event = body.data.event;

    // Data to be sent to all listener
    const data = body.data;

    globalIO.emit(body.event, data);

    res.status(200).send("Message triggered successfully");
    console.log("Successfully emit data");
  } else {
    console.log("Socket connection not established yet. Queuing message...");
    messageQueue.push({ event: "notifications", data: body });
    res.status(200).send("Message queued successfully");
  }
});

// ERP ENDPOINT
app.post("/erp", (req, res) => {
  const body = req.body;

  if (globalIO) {
    // Target socket event
    const event = body.data.event;

    // Data to be sent to all listener
    const data = body.data.data;

    globalIO.emit("erp-notifications", {
      data: {
        // event: "erp-notifications",
        data: {
          id: 1,
          message: "🔔 You have a new notification!",
          timestamp: "2025-05-22T14:00:00Z",
        },
      },
    });

    res.status(200).send("Message triggered successfully");
  } else {
    console.log("Socket connection not established yet. Queuing message...");
    messageQueue.push({ event: "notifications", data: body });
    res.status(200).send("Message queued successfully");
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");
  globalIO = io;

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Listen for erp-notifications sent from the client
  socket.emit("erp-notifications-2384", {
    data: {
      id: 1,
      message: "📢 Test notification from nodejs",
      timestamp: new Date().toISOString(),
    },
  });
});

// ERP EDITING
const activeUser = new Map();

io.on("connection", (socket) => {
  globalIO = io;

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("register-user", ({ userId, name }) => {
    activeUser.set(userId, {
      name: name,
      editing: true,
      devices: new Set([socket.id]),
    });

    // Send signal to all except for the editor
    socket.broadcast.emit("editing", {
      editable: false,
      editorId: userId,
      editorName: name,
    });
  });

  socket.on("authenticate", ({ id }) => {
    const user = activeUser.entries().next().value;

    if (user) {
      const [userId, { name }] = user;

      socket.emit("editing", {
        editable: userId === id,
        editorId: userId,
        editorName: name,
      });
    }
  });

  // rename to remove-user
  socket.on("logout", ({ userId, name }) => {
    if (activeUser.has(userId)) {
      const user = activeUser.get(userId);

      console.log(`User ${user.name} logged out from all devices`);

      activeUser.delete(userId); // Remove user from activeUser
    }

    // Send signal to all except for the editor
    socket.broadcast.emit("editing", {
      editable: true,
      editorId: null,
      editorName: null,
    });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

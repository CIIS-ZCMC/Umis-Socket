require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

/** Models */
// const Biolog = require("./models/Biolog");

const port = process.env.SERVER_PORT ?? 3025;
const host = process.env.SERVER_HOST ?? "localhost";
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
      process.env.ORIGIN_ERP_CLIENT,
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

// PPMP → per-row locks
// key: `${ppmpId}:${rowId}`
const ppmpEditors = new Map();

// AOP → per-document lock
// key: aopId
const aopObjectiveEditors = new Map();
const aopActivityEditors = new Map();
const onlineUsers = {}; // userId → socket.id

io.on("connection", (socket) => {
  console.log("A user connected");
  globalIO = io;

  socket.on("register-user", ({ userId }) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} registered on socket ${socket.id}`);
  });

  // === DISCONNECT HANDLER ===
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // === AOP OBJECTIVE CLEANUP ===
    const objectiveId = socket.data.aopObjectiveId;
    const aopId = socket.data.aopId;
    const aopActivityKey = socket.data.aopActivityKey;

    if (objectiveId && aopObjectiveEditors.has(objectiveId)) {
      aopObjectiveEditors.delete(objectiveId);
      socket
        .to(`aop:objective:${objectiveId}`)
        .emit("aop:unlock", { objectiveId });
      socket.to(`aop:${aopId}`).emit("aop:editing-stopped", { objectiveId });
    }

    if (aopActivityKey && aopActivityEditors.has(aopActivityKey)) {
      const editor = aopActivityEditors.get(aopActivityKey);
      aopActivityEditors.delete(aopActivityKey);

      socket.to(`aop:activity:${aopActivityKey}`).emit("aop:activity-unlock", {
        aopId: editor.aopId,
        objectiveId: editor.objectiveId,
        activityId: editor.activityId,
      });

      socket.to(`aop:${aopId}`).emit("aop:activity-editing-stopped", {
        aopId: editor.aopId,
        objectiveId: editor.objectiveId,
        activityId: editor.activityId,
      });
    }

    // === PPMP ROW CLEANUP ===
    for (let [key, editor] of ppmpEditors.entries()) {
      if (editor.socketId === socket.id) {
        ppmpEditors.delete(key);
        const [ppmpId, rowId] = key.split(":");
        socket
          .to(`ppmp:${ppmpId}`)
          .emit("ppmp:editing", { ppmpId, rowId, locked: false });
      }
    }
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

  // ERP events
  socket.on("erp-notification", (data) => {
    if (socket) {
      socket.broadcast.emit("erp-notification", data);
      console.log("Broadcasting ERP notification data");
    } else {
      console.log("Socket is undefined");
    }
  });

  socket.on("ppmp:join", ({ ppmpId }) => {
    socket.join(`ppmp:${ppmpId}`);
    console.log(`Socket ${socket.id} joined room ppmp:${ppmpId}`);

    // 🔁 Rehydrate existing locks for this PPMP
    for (const [key, editor] of ppmpEditors.entries()) {
      const [lockedPpmpId, rowId] = key.split(":");

      if (lockedPpmpId === String(ppmpId)) {
        socket.emit("ppmp:lock", {
          rowId,
          editorId: editor.userId,
          editorName: editor.name,
        });
      }
    }
  });

  // Leave a PPMP room
  socket.on("ppmp:leave", ({ ppmpId }) => {
    socket.leave(`ppmp:${ppmpId}`);
    console.log(`Socket ${socket.id} left room ppmp:${ppmpId}`);
  });

  // Start editing a row
  socket.on("ppmp:start-edit", ({ ppmpId, rowId, userId, name }) => {
    const key = `${ppmpId}:${rowId}`;
    const existing = ppmpEditors.get(key);

    // 🚫 Locked by someone else → reject only this socket
    if (existing && existing.userId !== userId) {
      socket.emit("ppmp:locked", {
        rowId,
        editorId: existing.userId,
        editorName: existing.name,
      });
      return;
    }

    // 🔒 Lock row
    ppmpEditors.set(key, { userId, name });

    // 🔒 Broadcast lock state
    socket.to(`ppmp:${ppmpId}`).emit("ppmp:lock", {
      rowId,
      editorId: userId,
      editorName: name,
    });

    // 🔔 Editing notification
    socket.to(`ppmp:${ppmpId}`).emit("ppmp:editing", {
      rowId,
      editorName: name,
    });
  });

  // Stop editing a row
  socket.on("ppmp:stop-edit", ({ ppmpId, rowId, userId }) => {
    const key = `${ppmpId}:${rowId}`;
    const editor = ppmpEditors.get(key);

    if (!editor || editor.userId !== userId) return;

    // 🔓 Unlock row
    ppmpEditors.delete(key);

    // 🔓 Broadcast unlock
    socket.to(`ppmp:${ppmpId}`).emit("ppmp:unlock", {
      rowId,
    });

    // 🔔 Editing stopped notification
    socket.to(`ppmp:${ppmpId}`).emit("ppmp:editing-stopped", {
      rowId,
    });
  });

  // Helper to generate a unique activity lock key
  const activityKey = (aopId, objectiveId, activityId) =>
    `${aopId}:${objectiveId}:${activityId}`;
  /* =========================
     AOP DOCUMENT EDITING
  ========================= */
  socket.on("aop:register", ({ aopId }) => {
    socket.join(`aop:${aopId}`);
    socket.data.aopId = aopId;

    // 🔔 Notify user of already locked objectives when they join
    for (const [objectiveId, editor] of aopObjectiveEditors.entries()) {
      if (editor.aopId === aopId) {
        socket.emit("aop:locked", {
          objectiveId,
          editorId: editor.userId,
          editorName: editor.name,
          aopId: editor.aopId,
        });
      }
    }

    // 🔔 Locked activities
    for (const [activityId, editor] of aopActivityEditors.entries()) {
      if (editor.aopId === aopId) {
        socket.emit("aop:activity-locked", {
          aopId,
          objectiveId: editor.objectiveId,
          activityId: editor.activityId,
          editorId: editor.userId,
          editorName: editor.name,
        });
      }
    }
  });

  socket.on("aop:start-edit", ({ aopId, objectiveId, userId, name }) => {
    const existing = aopObjectiveEditors.get(objectiveId);

    if (existing && existing.userId !== userId) {
      socket.emit("aop:locked", {
        objectiveId,
        editorId: existing.userId,
        editorName: existing.name,
        aopId: existing.aopId,
      });
      return;
    }

    aopObjectiveEditors.set(objectiveId, { userId, name, aopId });
    socket.join(`aop:objective:${objectiveId}`);

    // 🔒 Lock specific objective for others in the room
    socket.to(`aop:objective:${objectiveId}`).emit("aop:lock", {
      objectiveId,
      editorId: userId,
      editorName: name,
    });

    // 🔔 Notify everyone in the AOP that this objective is being edited
    socket.to(`aop:${aopId}`).emit("aop:editing", {
      objectiveId,
      editorName: name,
    });

    socket.data.aopObjectiveId = objectiveId;
    socket.data.aopId = aopId;
  });

  socket.on("aop:stop-edit", ({ aopId, objectiveId, userId }) => {
    const editor = aopObjectiveEditors.get(objectiveId);

    if (editor && editor.userId === userId) {
      aopObjectiveEditors.delete(objectiveId);

      socket.to(`aop:objective:${objectiveId}`).emit("aop:unlock", {
        objectiveId,
      });

      socket.to(`aop:${aopId}`).emit("aop:editing-stopped", {
        objectiveId,
      });
    }
  });

  socket.on(
    "aop:activity:start-edit",
    ({ aopId, objectiveId, activityId, userId, name }) => {
      // ✅ CREATE THE KEY
      const key = activityKey(aopId, objectiveId, activityId);

      const existing = aopActivityEditors.get(key);

      if (existing && existing.userId !== userId) {
        socket.emit("aop:activity-locked", {
          aopId,
          objectiveId,
          activityId,
          editorId: existing.userId,
          editorName: existing.name,
        });
        return;
      }

      // ✅ STORE USING THE SAME KEY
      aopActivityEditors.set(key, {
        userId,
        name,
        aopId,
        objectiveId,
        activityId,
      });

      // ✅ JOIN THE CORRECT ROOM
      socket.join(`aop:activity:${key}`);

      // 🔒 Lock activity for others
      socket.to(`aop:activity:${key}`).emit("aop:activity-lock", {
        aopId,
        objectiveId,
        activityId,
        editorId: userId,
        editorName: name,
      });

      // 🔔 Notify AOP room
      socket.to(`aop:${aopId}`).emit("aop:activity-editing", {
        aopId,
        objectiveId,
        activityId,
        editorName: name,
      });

      // ✅ SAVE FOR DISCONNECT CLEANUP
      socket.data.aopActivityKey = key;
      socket.data.aopId = aopId;
    },
  );

  socket.on(
    "aop:activity:stop-edit",
    ({ aopId, objectiveId, activityId, userId }) => {
      const key = activityKey(aopId, objectiveId, activityId);
      const editor = aopActivityEditors.get(key);

      if (editor && editor.userId === userId) {
        aopActivityEditors.delete(key);

        socket.to(`aop:activity:${key}`).emit("aop:activity-unlock", {
          aopId,
          objectiveId,
          activityId,
        });

        socket.to(`aop:${aopId}`).emit("aop:activity-editing-stopped", {
          aopId,
          objectiveId,
          activityId,
        });
      }
    },
  );

  while (messageQueue.length > 0) {
    console.log("Queue Task Trigered.");
    const queuedMessage = messageQueue.shift();
    globalIO.emit(queuedMessage.event, queuedMessage.data);
  }
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

// PNRS MONITORING END POINT
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
// Send notification to a specific user
app.post("/erp-notifications", (req, res) => {
  const body = req.body;
  console.log("DATA RECEIVED FROM ERP: ", body);
  if (globalIO) {
    // If specific event targeting is needed
    const event = body.event || "erp-notification";
    const data = body.data || body;
    globalIO.emit(event, data);
    res.status(200).send("ERP message broadcast successfully");
    console.log("Successfully emitted ERP data");
  } else {
    console.log("Socket connection not established yet. Queuing message...");
    messageQueue.push({ event: body.event || "erp-notification", data: body });
    res.status(200).send("ERP message queued successfully");
  }
});

// app.post("/erp", (req, res) => {
//   const body = req.body;
//   // body.data should include userId and notification payload
//   const userId = body.data.userId;
//   const notificationData = body.data.notification;

//   if (!userId || !notificationData) {
//     return res.status(400).send("Missing userId or notification data");
//   }

//   if (globalIO) {
//     // Emit directly to the specific user
//     globalIO.emit(`erp-notification-${userId}`, notificationData);

//     console.log("ERP notification sent to user", userId, notificationData);
//     res.status(200).send("Notification sent successfully");
//   } else {
//     console.log("Socket not ready, queuing message...");
//     messageQueue.push({
//       event: `erp-notification-${userId}`,
//       data: notificationData,
//     });
//     res.status(200).send("Notification queued successfully");
//   }
// });

server.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

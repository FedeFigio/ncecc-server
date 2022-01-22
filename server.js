const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const rooms = [];

io.on("connection", (socket) => {
  socket.on("start-hosting", (data) => {
    const newRoom = {
      id: `${data.room}:12345`,
      users: [data.username],
    };
    rooms.push(newRoom);
    socket.join(newRoom.id);
    socket.emit("hosting-started", newRoom);
  });
});

httpServer.listen(3001, () => {
  console.log("Linstening on port 3001...");
});

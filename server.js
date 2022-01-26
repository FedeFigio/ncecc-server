const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const uniqid = require("uniqid");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const rooms = [];
const users = [];
const socketUser = {};

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  socket.on("disconnect", (reason) => {
    const user = users.find((r) => r.id == socketUser[socket.id]);

    console.log("disconnected room", user, socket.id);
  });

  socket.on("create-room", (data) => {
    const newRoom = {
      id: getRoomIdentifier(data.room),
    };
    rooms.push(newRoom);
    socket.join(newRoom.id);

    const user = {
      id: uniqid(),
      socketId: socket.id,
      roomId: newRoom.id,
      username: data.username,
    };
    users.push(user);
    socketUser[socket.id] = user.id;

    socket.emit("room-created", newRoom, user);
    socket.broadcast.emit("rooms-list", rooms);
  });

  socket.on("request-start", (user) => {});

  socket.on("get-rooms", () => {
    socket.emit("rooms-list", rooms);
  });

  socket.on("get-players", (room) => {
    if (!room || !("id" in room)) return;
    socket.emit(
      "players-list",
      users.filter((u) => u.roomId == room.id)
    );
  });
});

httpServer.listen(3001, () => {
  console.log("Linstening on port 3001...");
});

function getRoomIdentifier(roomName) {
  const random = Math.floor(Math.random() * 10000);
  const stringId = `00000${String(random)}`.slice(-5);
  const roomId = `${roomName}#${stringId}`;

  const roomExists = rooms.findIndex((r) => r.id == roomId) > -1;
  if (roomExists) return getRoomIdentifier(roomName);
  return roomId;
}

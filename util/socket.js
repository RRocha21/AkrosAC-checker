const express = require('express');
const app = express();
const Cors = require('cors');
const socketIo = require('socket.io');

app.use(Cors());

module.exports = (httpServer) => {
  const io = socketIo(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: [],
      credentials: true,
    },
  });

  // Add your socket event listeners here
  io.on('connection', (socket) => {
    console.log('Client connected');
  });

  return io; // Optional: Return io if you need to use it elsewhere
};

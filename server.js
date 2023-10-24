const express = require('express');
const http = require('http');
const next = require('next');
const socketIo = require('socket.io');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = socketIo(httpServer, {
    cors: {
      origin: '*',
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');
    // You can emit events to your clients here
    // Example: socket.emit('event', { data: 'some data' });
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
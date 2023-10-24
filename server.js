const express = require('express');
const http = require('http');
const next = require('next');
const socketIo = require('socket.io');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const Cors = require('cors');

app.prepare().then(() => {
  // const server = require('http').createServer(app);
  // const httpServer = http.createServer(server);
  const server = http.createServer(app);
  const expressApp = express();

  const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        }
    }
  );

  expressApp.use(cors());

  io.on('connection', (socket) => {
    console.log('Client connected');
    // You can emit events to your clients here
    // Example: socket.emit('event', { data: 'some data' });
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
// socket.js
const Express = require('express');
const app = Express();
const http = require('http').Server(app);
const Cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [],
    credentials: true,
  },
});

app.use(Cors());

app.listen(8080, async () => {
  try {
    console.log('listening on *:8080');
  } catch (error) {
    console.log(error);
  }
});

module.exports = io; // Export the Socket.IO instance

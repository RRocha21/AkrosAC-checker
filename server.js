// server.js
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const socket = require('./util/socket.js');
const io = socket.init(server);

// Make sure the rest of your server setup is here

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});

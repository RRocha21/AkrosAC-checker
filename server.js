const express = require('express');
const next = require('next');
const http = require('http');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();
const httpServer = http.createServer(server);
const socket = require('./util/socket');
const io = socket.init(server);

app.prepare().then(() => {
  
  // Integrate socket.js here
  
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(8080, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:8080');
  });
});

const express = require('express');
const next = require('next');
const http = require('http');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  
  // Integrate socket.js here and store the return value (io)
  const io = require('./util/socket.js')(httpServer);
  
  // Make io accessible in API routes
  server.use((req, res, next) => {
    req.io = io;
    return next();
  });
  
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(8080, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:8080');
  });
});

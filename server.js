const express = require('express');
// const app = express();
const http = require('http');
const next = require('next');
const socketIo = require('socket.io');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const Cors = require('cors');

app.prepare().then(() => {
  const httpServer = http.createServer(server2);

  const server3 = require('http').createServer(app);
  
  const io = require("socket.io")(server, {
      cors: {
          origin: "*",
          methods: ["GET", "POST", "PUT", "DELETE"],
          }
      }
  );
  
  app.use(Cors());

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

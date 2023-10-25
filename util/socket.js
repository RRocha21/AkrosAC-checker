const socketIo = require('socket.io');

let io;

module.exports = {
  init: httpServer => {
    io = socketIo(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: [],
        credentials: true,
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
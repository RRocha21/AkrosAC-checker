import { getIo } from '../../util/socket.js';
const express = require('express');
const next = require('next');
const http = require('http');

const server = express();
const httpServer = http.createServer(server);

// Integrate socket.js here

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Webhook received:', req.body);
    const io = require('../../util/socket.js')(httpServer);

    io.emit('event', req.body);
    res.status(200).json({ message: 'Webhook received' });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

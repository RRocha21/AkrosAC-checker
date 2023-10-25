import { getIo } from '../../util/socket.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Webhook received:', req.body);

    const io = getIo();
    io.emit('event', req.body);
    res.status(200).json({ message: 'Webhook received' });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

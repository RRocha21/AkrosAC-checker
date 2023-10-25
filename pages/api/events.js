import { connectToDatabase } from '../../util/mongodb';
import io from '../../socket'; // Import the Socket.IO instance

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Webhook received:', req.body);

    // ... database operations ...

    io.emit('event', req.body);
    res.status(200).json({ message: 'Webhook received' });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
import { connectToDatabase } from '../../util/mongodb';
import { Server } from 'socket.io';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle the webhook event here
    console.log('Webhook received:', req.body);

    // You might want to do something with the database here
    // const { db } = await connectToDatabase();
    // ... database operations ...
    const io = new Server(res.socket.server);
    io.emit('event', req.body);
    res.status(200).json({ message: 'Webhook received' });


  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { steamUID } = req.query;
    const apiKey = '8D84EBFF5DCB6429F357949D448F406F';
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=76561198262506391`;

    try {
      const response = await axios.get(url);
      const players = response.data.response.players;
      if (players.length > 0) {
        const username = players[0].personaname;
        return res.status(200).json({ username });
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving Steam username:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
};

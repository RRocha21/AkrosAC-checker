// pages/api/getNickname.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { steamUID } = req.query;

    if (!steamUID) {
      return res.status(400).json({ error: 'SteamUID is required' });
    }

    try {
      // Load client secrets from a file.
      const auth = await authorize();
      const sheets = google.sheets({ version: 'v4', auth });

      // ID of the Google Sheets document and the name of the sheet.
      const spreadsheetId = 'AkrosAC';
      const range = 'Sheet1!A:B';  // Update with your range. Assuming column A has SteamUIDs and B has nicknames.

      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = response.data.values;

      if (rows.length) {
        // Find the nickname by SteamUID
        // Since the SteamUID is in column H and the nickname is in column F,
        // we use index 2 to find the SteamUID (0-based index, H is the 3rd column in the range F:H)
        // and index 0 to find the nickname (F is the 1st column in the range F:H)
        const nicknameRow = rows.find(row => row[2] === steamUID);
        if (nicknameRow) {
          return res.status(200).json({ nickname: nicknameRow[0] });
        } else {
          return res.status(404).json({ error: 'Nickname not found' });
        }
      } else {
        return res.status(404).json({ error: 'No data found in sheet' });
      }
    } catch (error) {
      console.error('The API returned an error: ' + error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '../../public/akrosac-37c432f5c235.json', // Update this with the path to your credentials file
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return await auth.getClient();
}

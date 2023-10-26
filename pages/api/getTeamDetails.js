// pages/api/getNickname.js
import { google } from 'googleapis';
const path = require('path');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { teamName } = req.query;

    if (!teamName) {
      return res.status(400).json({ error: 'teamName is required' });
    }

    try {
      // Load client secrets from a file.
      const auth = await authorize();
      const sheets = google.sheets({ version: 'v4', auth });

      // ID of the Google Sheets document and the name of the sheet.
      const spreadsheetId = '1GcB2hrsFo2KqTS_HyUENS3wvJN74-kUOp42r_dq11w0';
      const range = 'Sheet1!B:H';  // Update with your range. Assuming column A has SteamUIDs and B has nicknames.

      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = response.data.values;
      console.log('rows', rows)
      if (rows.length) {
        // Initialize an array to store the team names
        const players = [];

        const teamRowIndex = rows.findIndex(row => row[0] === teamName);

        if (teamRowIndex !== -1) {
          for (let i = 0; i < 5; i++) {
            const currentPlayerRow = rows[teamRowIndex + i];
            if (currentPlayerRow) {
              const steamId = currentPlayerRow[7]; // Assuming 'H' corresponds to index 7
              const nickname = currentPlayerRow[5]; // Assuming 'F' corresponds to index 5
              players.push({ steamId, nickname });
            }
          }
        }
        // Iterate through the rows of the sheet
        
        // Check if we found any teams
        if (players.length > 0) {
          // Send the team names back in the response
          return res.status(200).json({ players });
        } else {
          return res.status(404).json({ error: 'Players not found' });
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
    const credentialsPath = path.resolve(__dirname, '../../../../credentials.json');
    console.log('Attempting to load credentials from:', credentialsPath);
    
    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath, // Now using the correct path
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return await auth.getClient();
}

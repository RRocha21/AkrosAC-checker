// pages/api/getNickname.js
import { google } from 'googleapis';
const path = require('path');

export default async function handler(req, res) {
  if (req.method === 'GET') {

    try {
      // Load client secrets from a file.
      const auth = await authorize();
      const sheets = google.sheets({ version: 'v4', auth });

      // ID of the Google Sheets document and the name of the sheet.
      const spreadsheetId = '1GcB2hrsFo2KqTS_HyUENS3wvJN74-kUOp42r_dq11w0';
      const range = 'Sheet1!B:C';  // Update with your range. Assuming column A has SteamUIDs and B has nicknames.

      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = response.data.values;
      // console.log('rows', rows)
      if (rows.length) {
        // Initialize an array to store the team names
        const teams = [];
        
        // Iterate through the rows of the sheet
        for (const row of rows) {
          // Check if the row contains 'Official name of the team:'
          if (row[0] === 'Official name of the team:') {
            // Add the team name to the array
            teams.push(row[1]);
          }
        }
        
        // Check if we found any teams
        if (teams.length > 0) {
          // Send the team names back in the response
          return res.status(200).json({ teams });
        } else {
          return res.status(404).json({ error: 'Teams not found' });
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
    const credentialsPath = path.resolve(__dirname, '../credentials.json');
  
    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath, // Now using the correct path
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    console.log('auth', auth)
    return await auth.getClient();
}

import https from 'https';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const folderPath = path.join(process.cwd(), 'myFolder'); // Replace myFolder with the name of your folder
  const fileUrl = 'https://example.com/myfile.txt'; // Replace example.com/myfile.txt with the URL of the file you want to download

  const fileName = path.basename(fileUrl);
  const filePath = path.join(folderPath, fileName);

  const fileStream = fs.createWriteStream(filePath);

  https.get(fileUrl, (response) => {
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      res.status(200).send('File downloaded successfully');
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {
      res.status(500).send(err);
    });
  });
}
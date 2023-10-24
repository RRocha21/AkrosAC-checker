import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../../util/mongodb'
import https from 'https';

export default async function handler(req, res) {
  const folderPath = path.join(process.cwd(), 'public/fonts'); // Replace myFolder with the name of your folder
  const filePath = path.join(folderPath, 'stylesheet.css');

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    for (const file of files) {
      console.log(file)
      if (file === "stylesheet.css") {
      } else {
        fs.unlink(path.join(folderPath, file), (err) => {
          if (err) {
            res.status(500).send(err);
            return;
          }
        });
      }
    }

  });

  try {
    fs.writeFileSync(filePath, '');
    // res.status(200).send('The contents of the CSS file have been deleted successfully');
  } catch (err) {
    console.error(err);
    // res.status(500).send('An error occurred while deleting the contents of the CSS file');
  }

  const { db } = await connectToDatabase();

  const fonts = await db.collection("fonts").find({}).toArray();

  for (const font of fonts) {
    let fileUrl = 'https://bucketeer-75a3326a-ab9c-4ea3-9927-3856be7c0128.s3.amazonaws.com/' + font.file.woff_path; // Replace example.com/myfile.txt with the URL of the file you want to download
    let fileName = path.basename(fileUrl);
    let filePath = path.join(folderPath, fileName);
    let fileStream = fs.createWriteStream(filePath);

    let fileUrl_2 = 'https://bucketeer-75a3326a-ab9c-4ea3-9927-3856be7c0128.s3.amazonaws.com/' + font.file.woff2_path; // Replace example.com/myfile.txt with the URL of the file you want to download
    let fileName_2 = path.basename(fileUrl_2);
    let filePath_2 = path.join(folderPath, fileName_2);
    let fileStream_2 = fs.createWriteStream(filePath_2);

    https.get(fileUrl, (response) => {
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {
        res.status(500).send(err);
      });
    });

    https.get(fileUrl_2, (response) => {
      response.pipe(fileStream_2);

      fileStream_2.on('finish', () => {
        fileStream_2.close();
      });
    }).on('error', (err) => {
      fs.unlink(filePath_2, () => {
        res.status(500).send(err);
      });
    });
  }

  for (const font of fonts) {
    console.log(font.FontName)
    let sourceUrl = 'https://bucketeer-75a3326a-ab9c-4ea3-9927-3856be7c0128.s3.amazonaws.com/' + font.file.stylesheet_path; // Replace this URL with the URL of your source CSS file
    let destFilePath = path.join(process.cwd(), '/public/fonts', 'stylesheet.css'); // Replace dest.css with the name of your destination CSS file

    https.get(sourceUrl, (response) => {
      if (response.statusCode !== 200) {
        res.status(response.statusCode).send('Failed to download the source CSS file');
        return;
      }

      let rawData = '';

      response.on('data', (chunk) => {
        rawData += chunk;
      });

      response.on('end', () => {
        fs.appendFile(destFilePath, rawData, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('An error occurred while writing to the destination CSS file');
            return;
          }

        });
      });
    }).on('error', (err) => {
      console.error(err);
      res.status(500).send('An error occurred while downloading the source CSS file');
    });
  }

  res.status(200).send('Folder Updated successfully');
}
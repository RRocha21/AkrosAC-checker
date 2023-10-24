import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../../util/mongodb'
import https from 'https';

export default async function handler(req, res) {

  const { db } = await connectToDatabase();

  const stats = await db.collection("stats").find({}).toArray();

  const { streamerid, name, isCampaign, viewers } = req.query;

  let statId = "";

  for (const stat of stats) {
    if (stat.name === name) {
      if (isCampaign === "true") {
        if (stat.isCampaign) {
          statId = stat._id;
          break;
        }
      } else {
        if (!stat.isCampaign) {
          statId = stat._id;
          break;
        }
      }
    }
  }

  const result = await db.collection('stats').findOne({ _id: statId });

  let numberViewers = parseInt(viewers);
  if(result.streamers) {
    if (streamerid) {
      if(result.streamers.length === 0) {
        if (numberViewers === 0 || numberViewers === NaN || numberViewers === null || isNaN(numberViewers)) {
          console.log('no update because of NaN')
        } else {
          const newStreamer = {
            streamerName: streamerid,
            views: numberViewers,
            displayed: 1,
          };
          result.streamers.push(newStreamer);
          await db.collection('stats').updateOne({ _id: statId }, { $set: { streamers: result.streamers } });
        }
      } else {
        if (numberViewers === 0 || numberViewers === NaN || numberViewers === null || isNaN(numberViewers)) {
          console.log('no update because of NaN')
        } else {
          let flag = false;
          for (const streamer of result.streamers) {
            if (streamer.streamerName === streamerid) {
              streamer.views = streamer.views + numberViewers;
              streamer.displayed = streamer.displayed + 1;
              flag = true
              break;
            }
          }
          if (!flag) {
            const newStreamer = {
              streamerName: streamerid,
              views: numberViewers,
              displayed: 1,
            };
            result.streamers.push(newStreamer);
          }
          await db.collection('stats').updateOne({ _id: statId }, { $set: { streamers: result.streamers } });
        }
      }
    } 
    
  } else {
    console.log("no update because of no streamers")
  }

  console.log('numberViewers', numberViewers)
  if (numberViewers === 0 || numberViewers === NaN || numberViewers === null || isNaN(numberViewers)) {
    console.log('no update because of NaN')
  } else {
    let totalViews =  result.total_views + numberViewers;
    let totalDisplayed = result.total_displayed + 1;
    await db.collection('stats').updateOne({ _id: statId }, { $set: { total_views: totalViews, total_displayed: totalDisplayed } });
  }
  res.status(200).send('The contents of the CSS file have been deleted successfully');
} 
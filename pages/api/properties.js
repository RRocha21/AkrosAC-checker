
import { connectToDatabase } from '../../util/mongodb'

export default async function handler(req, res) {
    const { db } = await connectToDatabase();
    const streamers = await db
        .collection('streamers')
        .find({})
        .toArray();

    for (const streamer of streamers) {
        console.log(streamer.twitch_id);
    }
    res.json(streamers);
}
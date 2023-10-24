import { MongoClient } from 'mongodb';
import 'dotenv/config';


var username = process.env.ORMONGO_USER;
var password = process.env.ORMONGO_PW;
var hosts = process.env.ORMONGO_URL;
var database = process.env.ORMONGO_DB;
var options = process.env.ORMONGO_OPTIONS;



var MONGODB_URI = 'mongodb://' + username + ':' + password + '@' + hosts + '/' + database + options;
var MONGODB_DB = database;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

if (!MONGODB_DB) {
    throw new Error(
        'Please define the MONGODB_DB environment variable inside .env.local'
    );
}

let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
            return {
                client,
                db: client.db(MONGODB_DB),
            };
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}



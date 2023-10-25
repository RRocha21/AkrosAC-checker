const Express = require('express');
const app = Express();
const http = require('http').Server(app);
const Cors = require('cors');
import { connectToDatabase } from '../../util/mongodb'

const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: [],
        credentials: true
    }
});

app.use(Cors());



app.listen(8080, async () => {
    try {
        // const {db} = await connectToDatabase();
        console.log('listening on *:3000');
    } catch (error) {
        console.log(error);
    }
});







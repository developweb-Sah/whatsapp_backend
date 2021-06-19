// importing
// app config
// middleware
// db
// api routes
// listener
// fL9fMCP4hVMVaT31

// importing
import express from "express";
import mongoose from 'mongoose';
import dbMessages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

// app config
const app = express()
const port = process.env.PORT || 5001


const pusher = new Pusher({
    appId: "1222020",
    key: "b8abdbc59a352313e973",
    secret: "13cd89567997767e7f73",
    cluster: "eu",
    useTLS: true
    // encrypted:true
});

// middleware
app.use(express.json());

app.use(cors())

// app.use((req, res, next)=>{
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     next();
// })


// db
const connection_url = "mongodb+srv://admin:fL9fMCP4hVMVaT31@cluster0.s70do.mongodb.net/whatsappdb?retryWrites=true&w=majority"
 mongoose.connect(connection_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

const db = mongoose.connection

db.once('open',()=>{
    console.log("DB is Connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();
    console.log(changeStream);

    changeStream.on('change',(change)=>{
        console.log("A change occured",change);

        if(change.operationType == "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger('message', "inserted",
            {
                name: messageDetails.name,
                message: messageDetails.message,
                timeStamp : messageDetails.timeStamp,
                received : messageDetails.received,
            }
            );
        } else {
                console.log("Error triggering pusher");
        }
    })
})


// api routes
app.get('/', (req, res)=> res.status(200).send("hello Saheen"))

app.get("/message/sync", (req,res)=> { 
    dbMessages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req,res)=>{
    const dbMessage= req.body;

    dbMessages.create(dbMessage, (err, data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(201).send(data)
        }
    })
})

// listener
app.listen(port, ()=>console.log(`Listening on the localhost: ${port}`));
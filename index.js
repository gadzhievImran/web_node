const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const bodyParser = require('body-parser');
const randtoken = require('rand-token');
const objectId = require("mongodb").ObjectID;
const cors = require('cors');

const app = express();

app.use( bodyParser.json());       // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(cors());

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

let dbclient;
let db;
let coll;
let coll_messages;
app.use(express.static(__dirname + "/public"));

mongoClient.connect((err, client) => {
    if(err) return void console.log(err);
    dbclient = client;
    db = client.db('usersdb');
    coll = db.collection('users');
    coll_messages = db.collection('messages');
    app.listen(3000, function(){
        console.log("The server has started...");
    });
});

app.post('/messages', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    let { message, hasInput, name } = req.body;
    coll_messages.insertOne({ message, hasInput, name }, (err, result) => {
        if(err) {
            console.log('err', err);
            return void err;
        }

        console.log('result', result);
        res.send({ message });
    });
});

app.delete('/remove', (req, res) => {
    const { message } = req.body;
    coll_messages.findOneAndDelete({ message }, (err, result) => {
        if(err) return void console.log(err);

        console.log('result', result);
        res.send(result);
    });
});

app.get('/api/users', (req, res) => {
    coll.find({}).toArray((err, users) => {
        if(err) return void console.log(err);

        res.send(users);
    });
});

app.get('/api/messages', (req, res) => {
    coll_messages.find({}).toArray((err, messages) => {
        if(err) return void console.log(err);

        res.send(messages);
    });
});

app.post('/registration', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    const { name, password } = req.body;
    const user = { name, password };
    coll.insertOne(user, (err, result) => {
        if(err) return void err;

        res.send(user);
    });
});

app.put('/update', (req, res) => {
    if(!req.body) return void res.sendStatus(400);

    const { data: { message, oldMessage }} = req.body;

    coll_messages.findOneAndUpdate( { message: oldMessage }, { $set: { message } }, { returnOriginal: false }, (err, result) => {
        if(err) return void console.error(err);

        console.log(result);
        res.send(result);
    })
});

app.post('/authentication', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    const { name, password } = req.body;
    const user = { name, password };

    coll.findOne(user, (err, user) => {
        if(err) return void err;
        else if(user) {
            const token = randtoken.generate(16);

            coll.findOneAndUpdate(user, { $set: { name, password, token }}, { returnOriginal: false }, (err, result) => {
                if(err) return void console.log(err);

                console.log(result.value);
                // res.setHead
                res.send({
                    payload: {
                        token
                    },
                    status: 'OK'
                });
            });
        }else {
            res.send('Enter correct password');
        }
    });
});

app.post('/userinfo', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    const { token } = req.body;
    const user = { token };

    coll.findOne(user, (err, user) => {
        if(err) return void err;
        
        res.send(user);
    });
});

process.on('SIGINT', () => {
    dbclient.close();
    process.exit();
});

const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const bodyParser = require('body-parser');

const app = express();
app.use( bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

let dbclient;
let db;
let coll;
app.use(express.static(__dirname + "/public"));

mongoClient.connect((err, client) => {
    if(err) return void console.log(err);
    db = client.db('usersdb');
    coll = db.collection('users');
    app.listen(3000, function(){
        console.log("The server has started...");
    });
});

app.get('/api/users', (req, res) => {
    coll.find({}).toArray((err, users) => {
        if(err) return void console.log(err);

        res.send(users);
    });
});

app.post('/registration', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    const { name, email } = req.body;
    console.log(req.body);
    const user = { name, email };
    coll.insertOne(user, (err, result) => {
        if(err) return void err;

        console.log('result', result);
        res.send(user);
    });
});

app.post('/authentication', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    const { name, email } = req.body;
    const user = { name, email };

    coll.findOne({ name, email }, (err, user) => {
        if(err) return void err;

        console.log('user', user);
        res.send({ user });
    });
});

process.on('SIGINT', () => {
    dbclient.close();
    process.exit();
});

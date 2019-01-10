const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const bodyParser = require('body-parser');
const randtoken = require('rand-token');
const objectId = require("mongodb").ObjectID;
var cors = require('cors');



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

    const { name, password } = req.body;
    const user = { name, password };
    coll.insertOne(user, (err, result) => {
        if(err) return void err;

        res.send(user);
    });
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

process.on('SIGINT', () => {
    dbclient.close();
    process.exit();
});

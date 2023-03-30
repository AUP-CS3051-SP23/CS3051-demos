const { randomInt } = require('crypto');
const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

const sqlite3 = require('sqlite3').verbose();  // verbose() gives you better error codes. Remove when done debugging
// Open a new database connection to the database file
let database = new sqlite3.Database('mydatabase.db', function (error) {
    if (error) {
        console.error(err.message);
        return {};
    }
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index_all.html'));
});

app.get('/getusers', function (req, res) {
    getUsers(database)
        .then((users) => {
            res.json(users);
        });
});

app.get('/adduser', function (req, res) {
    const id = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER));
    addUser(database, id, req.query.name)
        .then(function () {
            res.end();
        });
});

async function getUsers(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function addUser(db, id, name) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO users ('id', 'name') VALUES (?, ?)", [id, name], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});

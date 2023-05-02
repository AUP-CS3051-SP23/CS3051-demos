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
    let name = req.query.name;
    // const id = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER));
    addUser(database, req.query.name)
        .then(function () {
            res.end();
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).end();
        });
});

async function addUser(db, name) {
    return new Promise((resolve, reject) => {
        db.get("SELECT MAX(id) AS maxid FROM users", function (err, row) {
            if (err) {
                reject(err);
            } else {
                console.log(row);
                let id = row.maxid + 1;
                db.run("INSERT INTO users ('id', 'name') VALUES (?, ?)", [id, name], function (err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        // perhaps put the new userid into a cookie or
                        // return it to the browser to save
                        resolve();
                    }
                });
            }
        });
    });
}

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


// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});

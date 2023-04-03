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
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});


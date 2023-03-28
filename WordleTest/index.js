const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files


/* This code sends a fixed text string */
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'main.html'));
});

/* PUT YOUR app.get CODE HERE to return a list of words that match the pattern
    You may want to return the list of words as a JSON string for easier parsing
    on the client side.  You can do this by using res.json(list) instead of res.send(list)
*/


// Read the word list into memory
const fs = require('fs');
let wordlist = [];
fs.readFile(path.join(__dirname, 'enwords.txt'), 'utf8', function (err, data) {
    wordlist = data.split('\n');
});

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});


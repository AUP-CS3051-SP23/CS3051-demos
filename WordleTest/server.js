const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

const mustacheExpress = require('mustache-express');  // include the mustache module
app.engine('mst', mustacheExpress()); // register the .mst extension with the engine
app.set('views', path.join(__dirname, 'templates')) // set the directory for the .mst files
app.set('view engine', 'mst'); // set engine to render .mst files

app.use(express.static('.'));

/* This code sends a fixed text string */
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Read the word list into memory
const fs = require('fs');
let wordlist = [];
fs.readFile(path.join(__dirname, 'enwords.txt'), 'utf8', function (err, data) {
    wordlist = data.split('\n');
});

app.get("/testword", function (req, res) {
    let word = req.query.word;
    // find the words in the wordlist that match the reqular expression
    let list = wordlist.filter(function (item) {
        return item.match(word);
    });
    res.render('wordlist', {"wordlist": list});
});

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});


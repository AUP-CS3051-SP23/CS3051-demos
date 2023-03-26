const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

const mustacheExpress = require('mustache-express');  // include the mustache module
app.engine('mst', mustacheExpress()); // register the .mst extension with the engine
app.set('views', path.join(__dirname, 'templates')) // set the directory for the .mst files
app.set('view engine', 'mst'); // set engine to render .mst files


/* This code sends a fixed text string */
app.get('/', function(req, res) {
  res.render('hello', {"name": "David J. Sturman"});
});

// This code return jpg images, html, css, and js files
// The first parameter is an array of file extensions to match
app.get(['/*.jpg', '/*.css', '/*.html', '/*.js'], function (req, res) {
  res.sendFile(path.join(__dirname, req.path)); // req.path is the path of the requested file
});

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function() {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
  });
  
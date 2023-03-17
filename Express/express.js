const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function() {
  console.log("App server is running on port", port);
  console.log("to end press Ctrl + C");
});

/* This code sends a fixed text string */
app.get('/', function(req, res) {
  res.send('Hello World');
});

/* This code sends a file (containing the HTML for a web page) */
app.get('/fetch', function(req, res) {
  res.sendFile(path.join(__dirname, 'fetch.html'));
});

// This code sends some text
app.get('/textresponse', function(req, res) {
  res.send("Thank you for clicking on me");
});

// This code return jpg images, html, css, and js files
// The first parameter is an array of file extensions to match
app.get(['/*.jpg', '/*.css', '/*.html', '/*.js'], function (req, res) {
  res.sendFile(path.join(__dirname, req.path)); // req.path is the path of the requested file
});



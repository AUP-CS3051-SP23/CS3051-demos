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
  res.sendFile(path.join(__dirname, 'main.html'));
});

/* This code sends a file (containing the HTML for a web page) */
const list = [
  "https://picsum.photos/id/31/3264/4912",
  "https://picsum.photos/id/33/5000/3333",
  "https://picsum.photos/id/30/1280/901",
  "https://picsum.photos/id/43/1280/831",
  "https://picsum.photos/id/53/1280/1280"
];
app.get('/img', function(req, res) {
  let i = Math.floor(Math.random()*list.length);
  let url = list[i];
  res.send(url);
});

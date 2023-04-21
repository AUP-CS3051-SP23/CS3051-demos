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
app.get('/', function(req, res) {
  res.render('hello', {name: "David Sturman"});
});

app.get('/:name', function(req, res) {
  res.render('hello2', {name: req.params.name});
});

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function() {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
  });
  
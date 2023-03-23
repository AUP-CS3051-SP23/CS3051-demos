const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

// Start listening for requests on the designated port
// This can be at the beginning, or the end, or in-between.
// Conventionally it is put at the end
let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/okay', function (req, res) {
    res.send("Hello, this is a 200 response");
});

const fs = require('fs');

app.get('/filenotfound', function (req, res) {
    const p = path.join(__dirname, 'this_file_does_not_exist.html');
    if (fs.existsSync(p)) {
        res.sendFile(p);
    }
    else {
        res.status(404).send("Sorry can't find that file!");
    };
});

app.get('/500', function (req, res) {
    res.status(500).send("This is a 500 response");
});

app.get('/teapot', function (req, res) {
    res.status(418).send("Are you kidding me?");
});

app.get(['/*.jpg', '/*.css', '/*.html', '/*.js', '/*.gif'], function (req, res) {
    res.sendFile(path.join(__dirname, req.path)); // req.path is the path of the requested file
  });

app.get("/headers", function (req, res) {
    let h = {};
    h.headers = req.headers;
    h.userAgent = req.get("user-agent");
    res.json(h);
});

// if no other route matches, send the 404 page
// app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, "404.html"));
// });
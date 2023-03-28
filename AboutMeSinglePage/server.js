const express = require('express');
const app = express();
const port = 8080;
const path = require('path')


let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press ctrl + c");
});



app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'aboutme.html'));
});

// app.get('/home', function (req, res) {
//     res.sendFile(path.join(__dirname, 'home.html'));
// });

// app.get('/likes', function (req, res) {
//     res.sendFile(path.join(__dirname, 'likes.html'));
// });

// app.get('/sites', function (req, res) {
//     res.sendFile(path.join(__dirname, 'sites.html'));
// });

// app.get('/lived', function (req, res) {
//     res.sendFile(path.join(__dirname, 'lived.html'));
// });

app.get(['/*.jpg', '/*.css', '/*.html', '/*.js'], function (req, res) {
    res.sendFile(path.join(__dirname, req.path));
});

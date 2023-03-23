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

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/name/:myname', function (req, res) {
    console.log(req.cookies);  // this will print out the cookies
    // this will set a cookie
    res.cookie('name', req.params.myname, { maxAge: 10000 });
    res.end();
});

app.get('/visits', function (req, res) {
    let visits = 0;
    if (req.cookies.visits) {
        visits = parseInt(req.cookies.visits);
    }
    visits++;
    res.cookie('visits', visits, { maxAge: 1000 * 1000 });
    res.send(`${visits}`);
});

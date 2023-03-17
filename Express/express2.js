/****
This shows different methods of calling a nodejs server from a web page.
Once the server starts up, it listens for requests from browsers.
The basic request returns the HTML for a web page (fetch2.html).
That's the page you see when you go to that URL.

Using app.get() and app.post() you can set up "routes".
These are strings in the URL following the URL (https://localhost:8080/)
and recognized by the server. For example, `app.get('/textresponse')` responds to
(https://localhost:8080/textresponse)

The difference between GET and POST is that GET has argument valuesin the URL and
POST has argument values passed as a "body" attribute in the HTTP call.

The server code example here has a mix of GETs and POSTs, some returning text,
some returning a file, and some returning JSON.
****/

// The following lines set up the webserver using the express module
const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

// Return an HTML file to a request to the domain's URL
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'fetch2.html'));  // res.sendFile sends the contents of a file
});

// Return a fixed string to a /textresponse GET request
app.get('/textresponse', function (req, res) {
    res.send("Thank you for clicking on me");
});

// return a JSON object to a /jsonresponse1 GET request
app.get('/jsonresponseA', function (req, res) {
    res.json(// res.json() sends an object as JSON
        {
            item1: 'This is item1',
            item2: 'This is two',
            item3: 3
        }
    );
});

// a different way to return a JSON object
let myobj = {};
myobj.fn = "david";
myobj.ln = "sturman";
myobj.class = {
    dept: "CS",
    num: 3051,
    school: "AUP"
};
app.get('/jsonresponseB', function (req, res) {
    res.json(myobj);  // return JSON
});

// Return a JSON object to a GET request with parameters as part of the URL
app.get('/getrequest/:first/:last', function (req, res) {
    console.log(req.params);
    let fn = req.params.first;  // use res.query.<field_name> for GET parameters
    console.log(fn);
    fn = fn[0].toUpperCase() + fn.slice(1);
    let ln = req.params.last;
    ln = ln.toUpperCase();
    res.json({ last: ln, first: fn });  // return JSON
});

// Return a JSON object to a GET request with parameters in the URL string
app.get('/getrequest', function (req, res) {
    console.log(req.query);
    let fn = req.query.first;  // use res.query.<field_name> for GET parameters
    fn = fn[0].toUpperCase() + fn.slice(1);
    let ln = req.query.last;
    ln = ln.toUpperCase();
    res.json({ last: ln, first: fn });  // return JSON
});

// Return the contents of a file
app.get('/books', function (req, res) {
    res.sendFile(path.join(__dirname, 'goodbooks.html'));
});

// Return the contents of a file
app.get('/images', function (req, res) {
    res.sendFile(path.join(__dirname, 'images.html'));
});

// return jpg images, html, css, and js files
app.get(['/*.jpg', '/*.css', '/*.html', '/*.js'], function (req, res) {
    res.sendFile(path.join(__dirname, req.path));
});


// You need the body-parser package to help parse the body of a post request
const bodyParser = require('body-parser'); // this pulls in body-parser
app.use(bodyParser.json());  // this tells the server to look for JSON requests

// Return a text string to a POST request with parameters in the request body
app.post('/postrequest', function (req, res) {
    console.log(req.body);
    let fn = req.body.first;  // use res.body.<field_name> in POST requests
    fn = fn[0].toUpperCase() + fn.slice(1);
    let ln = req.body.last;
    ln = ln.toUpperCase();
    res.json({ last: ln, first: fn });  // return JSON
});

// Start listening for requests on the designated port
app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});

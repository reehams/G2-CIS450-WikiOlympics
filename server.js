// Set everyting up
var express = require('express');
var path = require('path');
var app = express(); // define express instance as the app
var port = process.env.PORT || 8080;
var pg = require('pg');

var index = require('./routes/router');

app.use('/', index);
app.use('#/bro', index);

app.use(express.static(path.join(__dirname)));


// TODO FIND OUT WHAT THIS DOES AND SEE IF IT IS NEEDED
// especially if we deploy on Heroku
app.listen(port, function(){
	console.log('App is running on port' + port);
});



// Set everyting up 
var express = require('express');
var path = require('path');
var app = express(); // define express instance as the app

var index = require('./routes/router');

app.use('/', index);

app.use(express.static(path.join(__dirname))); 


// TODO FIND OUT WHAT THIS DOES AND SEE IF IT IS NEEDED
// especially if we deploy on Heroku
app.listen('8080', function(){
	console.log('Server running on port 8080');
});



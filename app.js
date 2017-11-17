// Set everyting up 
var express = require('express');
var path = require('path');
var app = express(); // define express instance as the app

var index = require('./routes/router');

app.use('/', index);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// TODO FIND OUT WHAT THIS DOES AND SEE IF IT IS NEEDED
app.listen('8080', function(){
	console.log('Server running on port 8080');
});



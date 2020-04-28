var process = require('process');
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/CardsHomePage.html');
});

app.use('/',express.static(__dirname + '/'));

serv.listen(3003, null, null, function() {
    console.log(`Example app listening at http://localhost:${3003}`);
});
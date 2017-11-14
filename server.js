const express = require('express');
const app = require('express')();
const http = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'))

http.listen(3009, function(){
	console.log('listening on *:3009');
});

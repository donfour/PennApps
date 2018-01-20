var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var codeRange = 100000;

var waitingConnections = {};


app.use(express.static('public'));

app.get('/', function(request, response) {
    res.sendFile(__dirname + '/public/space.html');
});


io.on('connection' , function(client) {
    
    client.on('requestCode' , function() {
	var code = generateCode();
	io.to(client.id).emit('neededCode' , code);
    });

    client.on('sendCode', function(code) {
    });
});


http.listen(port, function() {
    console.log('listening on *:' + port);
});

//make this better later (need to at least 
function generateCode() {
    var number = Math.floor(Math.random() * codeRange);
    if (!(number in waitingConnections)) {
	return number;
    }

    generateCode();
}

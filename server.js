var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var codeRange = 100000;

var connections = {};

var iosToClientMap = {};

var clientToIosMap ={};



app.use(express.static('public'));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public/space.html');
});


io.on('connection' , function(client) {
     
    client.on('requestCode' , function() {
	var code = generateCode();
	connections[code] = client.id;
	io.to(client.id).emit('getCode' , code);
    });

    client.on('sendCode', function(code) {
	sendCodeHelper(code, client);	
    });

    client.on('sendAction', function(value) {
	actionHelper(value, client);
    });

    console.log("client connected");
});


http.listen(port, function() {
    console.log('listening on *:' + port);
});

//make this better later (need to at least 
function generateCode() {
    var number = Math.floor(Math.random() * codeRange);
    if (!(number in connections)) {
	return number;
    }

    generateCode();
}

function sendCodeHelper(code, client) {
    console.log("sendCode event triggered:" + code);
    if (!(code in connections)) {
	return;
    }
    
    compClient = connections[code];
    if (clientToIosMap[compClient] != undefined) {
	return;
    }
    
    if (iosToClientMap[client.id] != undefined) {
	return;
    }
    
    clientToIosMap[compClient] = client.id;
    iosToClientMap[client.id] = compClient;
    console.log("connected");
}

function actionHelper(value, client) {
    console.log(value);
    
    //socket ids are unique
    if (client in iosToClientMap) {
	io.to(iosToClientMap[client.id]).emit("sendAction", value);
    }
    
    if (client in clientToIosMap) {
	io.to(clientToIosMap[client.id]).emit("sendAction", value);
	
    }
}

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
    response.sendFile(__dirname + '/public/index.html');
});


io.on('connection' , function(client) {

    client.on('requestCode' , function() {
    	var code = generateCode();
    	connections[code] = client.id;
    	io.to(client.id).emit('getCode' , code);
    });

    client.on('sendCode', function(code) {
    	var accepted = sendCodeHelper(code, client);
    	io.to(client.id).emit("codeAccepted", accepted);
    });

    client.on('sendAction', function(value) {
    	actionHelper(value, client);
    });

    client.on('disconnect', function() {
	     disconnectHelper(client);
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
	return false;
    }

    compClient = connections[code];
    if (compClient in clientToIosMap) {
	return false;
    }

    if (client.id in iosToClientMap) {
	return false;
    }

    clientToIosMap[compClient] = client.id;
    iosToClientMap[client.id] = compClient;
    console.log("connected");
    io.to(compClient).emit("phoneConnected");
    return true;
}

function actionHelper(value, client) {
    console.log(value);

    //socket ids are unique

    //send to computer
    if (client.id in iosToClientMap) {
	io.to(iosToClientMap[client.id]).emit("sendAction", value);
    }

    //send to phone
    if (client.id in clientToIosMap) {
	io.to(clientToIosMap[client.id]).emit("sendAction", value);

    }
}

function disconnectHelper(client) {
    if (client.id in iosToClientMap) {
	var computerId = iosToClientMap[client.id];
	io.to(computerId).emit('phoneDisconnected');
	delete iosToClientMap[client.id];
	delete clientToIosMap[computerId];
	deleteCode(computerId);
    }

    if (client.id in clientToIosMap) {
	var phoneId = clientToIosMap[client.id];
	io.to(phoneId).emit('computerDisconnected');
	delete clientToIosMap[client.id];
	delete iosToClientMap[phoneId];
	deleteCode(client.id); //optimize by creating other map
    }
}

function deleteCode(computerId) {

    for (var key in connections) {
	if (connections[key] == computerId) {
	    delete connections[key];
	}
    }
}

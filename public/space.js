var socket = io();

var position = [250, 250];
var radius = 10;
    
socket.on("getCode", function(code) {
    console.log(code);
});

socket.on("sendAction", function(value) {
    clearCircle();
    if (value == 'left') {
	position[0] -= 1;
    }
    if (value == 'right') {
	position[1] += 1;
    }
});

socket.emit("requestCode");

function drawCircle() {
    var c=document.getElementById("game");
    var ctx=c.getContext("2d");
    ctx.beginPath();
    context.strokeStyle = '#ff0000';
    ctx.arc(position[0],position[1],radius,0,2*Math.PI);
    ctx.stroke();
}

function clearCircle() {
    var c=document.getElementById("game");
    var ctx=c.getContext("2d");
    ctx.beginPath();
    ctx.arc(position[0],position[1],radius,0,2*Math.PI);
    context.strokeStyle = '#ffffff';
    ctx.stroke();
}





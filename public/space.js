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
	position[0] += 1;
    }
    drawCircle();
});

socket.emit("requestCode");

function drawCircle() {
    var c=document.getElementById("game");
    var ctx=c.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.arc(position[0],position[1],radius,0,2*Math.PI);
    ctx.stroke();
}

function clearCircle() {
    var c=document.getElementById("game");
    var ctx=c.getContext("2d");
    ctx.beginPath();
    ctx.arc(position[0],position[1],radius,0,2*Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.clearRect(0, 0, 500, 500);
}





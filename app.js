function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var color = getRandomColor();
var userId = makeid();

var socket = new WebSocket("ws://localhost:7331", );

socket.onopen = function (event) {
    socket.send(JSON.stringify({color, userId, create: true}));
};

socket.onmessage = function (event) {
    var players = JSON.parse(event.data).players;
    var food = JSON.parse(event.data).food;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, w, h);

    for(var id in players){
        var player = players[id];
        var snake = player.snake;

        for (var i = 0; i < snake.length; i++) {
            var c = snake[i];
            //Lets paint 10px wide cells
            paint_cell(c.x, c.y, player.color);
        }
        
    }

    for(var id in food){
        paint_cell(food[id].x, food[id].y, 'black')
    }
    
    d = players[userId].direction;
}

var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;

var cw = 10;
var d;


//Lets first create a generic function to paint cells
function paint_cell(x, y, paintColor) {
    ctx.fillStyle = paintColor;
    ctx.fillRect(x * cw, y * cw, cw, cw);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x * cw, y * cw, cw, cw);
}

window.addEventListener('keydown', function (event) {

    var key = event.keyCode;

    var tempD = d;

    if (key == "37" && d != "right") d = "left";
    else if (key == "38" && d != "down") d = "up";
    else if (key == "39" && d != "left") d = "right";
    else if (key == "40" && d != "up") d = "down";

    if (d !== tempD) socket.send(JSON.stringify({
        userId: userId,
        direction: d
    }));

}, false);

window.onbeforeunload = function() {
    socket.onclose = function () {}; // disable onclose handler first
    socket.send(JSON.stringify({userId, close: true}));
    socket.close()
};
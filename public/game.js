
var socket = io();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

//setup for game sound
var backgroundMusic, shootSound, hitSound, deathSound;
function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}
backgroundMusic = new Sound("./sound/background-music.mp3");
backgroundMusic.sound.loop = true;
shootSound = new Sound("./sound/shoot.wav");
hitSound = new Sound("./sound/hit.wav");
deathSound = new Sound("./sound/death.wav");
letterSound = new Sound("./sound/Collect_Point_01.mp3");
allLettersSound = new Sound("./sound/Jingle_Win_00.mp3");


var gameStarted = false;
var Draw;
function setHandlers() {
    socket.on("getCode", function(code) {
	document.getElementById("code").innerHTML = code;
    });

    socket.on("sendAction", function(value) {

	if (player.isDead || !gameStarted) return;


	if (value == "left") {
	    player.left();
	}

	if (value == "right") {
	    player.right();
	}

	if (value == "shoot") {
      shootSound.play();
	    player.shoot();
	}


    });

    socket.on("phoneConnected", function() {
        var startMenu = document.getElementsByClassName("start");
        for (var el of startMenu)
            el.style.display = "none";

        canvas.style.display = "block";
	init();
        start();
    });

    socket.on("phoneDisconnected", function() {
	alert("Sorry.  Your phone seems to have disconnected");
	window.location.href = "";
    });
}

setHandlers();

socket.emit("requestCode");

var lineHeight = 40;

var manager = new AssetManager();
var images = [
    "enemyShip",
    "greenShip",
    "invader1Position1",
    "invader1Position2",
    "invader2Position1",
    "invader2Position2",
    "invader3Position1",
    "invader3Position2",
    "invaderDestroyed",
    "killedGreenShip",
    "A",
    "A_placeholder",
    "E",
    "E_placeholder",
    "N",
    "N_placeholder",
    "P",
    "P_placeholder",
    "S",
    "S_placeholder"
];

for (var i=0; i < images.length; i++)
    manager.queueDownload("img/" + images[i] + ".png");

var player,
    background,
    enemies,
    deaths,
    enemyShots,
    dir,
    score,
    lives,
    countSinceStart,
    letters,
    fallingLetters;

function init() {
    player = new Player(250, lineHeight * 13);
    background = new Rectangle(0, 0, canvas.width, canvas.height, new Color(0, 0, 0));
    enemies = [];
    deaths = [];
    enemyShots = [];
    dir = "right";
    score = 0;
    lives = 3;
    countSinceStart = 0;
    letters = [new Letter("P"), new Letter("E"), new Letter("N"), new Letter("N"), new Letter("A"), new Letter("P"), new Letter("P"), new Letter("S")];
    fallingLetters = [];
}

manager.downloadAll(function() {

});


function end() {
    gameStarted = false;
    var endMenu = document.getElementsByClassName("end");
    for (var el of endMenu)
        el.style.display = "block";
    canvas.style.display = "none";
    clearInterval(Draw);
    document.getElementById("score").innerHTML = score;
}

function restart() {
    var endMenu = document.getElementsByClassName("end");
    for (var el of endMenu)
        el.style.display = "none";
    canvas.style.display = "block";
    init();
    start();
}


function start()
{
    gameStarted = true;

    backgroundMusic.play();

    player = new Player(250, lineHeight * 13);

    for (var i = 0; i < 11; i++)
        enemies[i] = new Column(i + 1, 3);


    Draw = setInterval(function() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // BACKGROUND
        background.Draw(ctx);

        // SHIFT ENEMIES
        for (var i = 0; i < enemies.length; i++)
        {
            var col = enemies[i],
                first = col.enemies[0];
            col.shift(dir);
        }

        var first = enemies[0],
            last = enemies[enemies.length - 1];
        if (first.enemies[0].rect.x <= 0)
        {
            dir = "right";
            for (var col of enemies)
                col.shift("down");
        }
        else if (last.enemies[0].rect.x + last.enemies[0].rect.width >= canvas.width)
        {
            dir = "left";
            for (var col of enemies)
                col.shift("down");
        }

        // DRAW ENEMIES
        for (var i = 0; i < enemies.length; i++)
            for (var j = 0; j < enemies[i].enemies.length; j++)
                draw(enemies[i].enemies[j]);

        // DRAW PLAYER
        if (!player.isDead)
            draw(player);

        // SHOT
        if (player.shot)
        {
            player.shot.rect.y -= player.shot.speed;
            draw(player.shot);

            if (player.shot.rect.y + player.shot.rect.height < 0)
            {
                player.shot = null;
            }

            if (player.shot)
            {
                LOOP:for (var i = 0; i < enemies.length; i++)
                {
                    var col = enemies[i];
                    for (var j = 0; j < col.enemies.length; j++)
                    {
                        var e = col.enemies[j];
                        // shot hits enemy
                        if (player.shot.rect.Intersects(e.hitbox))
                        {
                            hitSound.play();
                            deaths.push(new Death(e.rect.x, e.rect.y));
                            col.enemies.splice(j, 1);
                            if (col.enemies.length == 0)
                                enemies.splice(i, 1);
                            player.shot = null;
                            score += e.score;

                            var random = Math.random();
                            if (random < 0.5)
                            {
                                random = Math.random();
                                var letter;
                                if (random < 0.2)
                                    letter = "A";
                                else if (random < 0.4)
                                    letter = "E";
                                else if (random < 0.6)
                                    letter = "N"
                                else if (random < 0.8)
                                    letter = "P";
                                else
                                    letter = "S";

                                var lett = new Letter(letter, true);
                                lett.rect = new Rectangle(e.rect.x, e.rect.y, 30, 30);
                                fallingLetters.push(lett);
                            }
                            break LOOP;
                        }
                    }

                }

            	//recreate enemies to continue game
            	if (enemies.length == 0) {
            	    for (var i = 0; i < 11; i++)
            		enemies[i] = new Column(i + 1, 3);
            	}
            }
        }

        // ENEMY FIRE
        for (var i = 0; i < enemyShots.length; i++)
        {
            enemyShots[i].rect.y += enemyShots[i].speed;

            if (enemyShots[i].rect.y > canvas.height)
            {
                enemyShots.splice(i, 1);
                i--;
                continue;
            }

            if (!player.isDead && enemyShots[i].rect.Intersects(player.hitbox))
            {
                deathSound.play();
		            socket.emit("sendAction", "vibrate");
                player.isDead = true;
                lives--;
                deaths.push(new PlayerDeath(player.rect.x, player.rect.y - player.rect.height/2));
                enemyShots.splice(i, 1);
                i--;
                continue;
            }

            draw(enemyShots[i]);
        }

        countSinceStart++;
        if (countSinceStart > 100)
        {
            var random = Math.random();
            if (!player.isDead && random < 0.02)
            {
                var index = Math.floor(Math.random() * enemies.length),
                    enemy = enemies[index].enemies[enemies[index].enemies.length - 1];
                enemyShots.push(new Shot(enemy.rect.x, enemy.rect.y));
            }
        }

        // DEATHS
        for (var i = 0; i < deaths.length; i++)
        {
            var death = deaths[i];
            death.lifetime++;
            if (death.lifetime >= death.maxLifetime)
            {
                deaths.splice(i, 1);
                if (death.isPlayerDeath)
                {
                    player.isDead = false;
                }
            }
            else
            {
                draw(death);
            }
        }

        // FALLING LETTERS
        for (var i = 0; i < fallingLetters.length; i++)
        {
            fallingLetters[i].rect.y += fallingLetters[i].speed;
            draw(fallingLetters[i]);

            if (fallingLetters[i].rect.y > canvas.height)
            {
                fallingLetters.splice(i, 1);
                i--;
            }
            else if (!player.isDead && fallingLetters[i].rect.Intersects(player.hitbox))
            {
                for (var j = 0; j < letters.length; j++)
                {
                    if (!letters[j].filled && letters[j].fillFrame == fallingLetters[i].fillFrame)
                    {
                        letters[j].filled = true;
                        letters[j].frame = letters[j].fillFrame;
                        letterSound.play();
                        break;
                    }
                }
                fallingLetters.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < letters.length; i++)
        {
            if (!letters[i].filled) break;
            if (i == letters.length - 1)
            {
                letters = [new Letter("P"), new Letter("E"), new Letter("N"), new Letter("N"), new Letter("A"), new Letter("P"), new Letter("P"), new Letter("S")];
                score += 1700;
                allLettersSound.play();
            }
        }

        // DISPLAY SCORE
        ctx.font = "30px geo";
        ctx.fillStyle = "white";
        ctx.fillText("SCORE", 50, 35);
        ctx.fillStyle = "#00FD10";
        ctx.fillText(score, 50, 60);

        // DISPLAY BONUS
        ctx.fillStyle = "white";
        ctx.fillText("BONUS", 250, 35);
        for (var i = 0; i < letters.length; i++)
        {
            var rect;
            if (letters[i].filled)
            {
                letters[i].rect = new Rectangle(165 + 30*i, 40, 30, 30);

            }
            else
            {
                letters[i].rect = new Rectangle(165 + 30*i, 40, 30, 30);
            }
            draw(letters[i]);
        }

        // DISPLAY LIVES
        ctx.fillText("LIVES", 455, 35);
        if (lives > 0)
            draw(new Life(450, 35));
        if (lives > 1)
            draw(new Life(490, 35));
        if (lives > 2)
            draw(new Life(530, 35));

        if (lives <= 0)
        {
            end();
        }

    }, 33);
}

function draw(obj)
{
    if (obj.frame == null)
    {
        obj.rect.Draw(ctx);
    }
    else if (obj.frame == "shot")
    {
        var w = obj.width,
            h = obj.height,
            x = Math.abs(obj.rect.width - w) / 2 + obj.rect.x - w,
            y = Math.abs(obj.rect.height - h) / 2 + obj.rect.y - h;

        ctx.fillStyle = "white";
        ctx.fillRect(x, y, w, h);
    }
    else if (obj.frame != "_blank_")
    {
        var w = obj.width,
            h = obj.height,
            x = Math.abs(obj.rect.width - w) / 2 + obj.rect.x,
            y = Math.abs(obj.rect.height - h) / 2 + obj.rect.y;
        // console.log(w,h,x,y);
        ctx.drawImage(manager.getAsset("img/" + obj.frame + ".png"), x, y, w, h);

        // if (obj.hitbox)
        // {
        //     ctx.fillStyle = "red";
        //     ctx.fillRect(obj.hitbox.x, obj.hitbox.y, obj.hitbox.width, obj.hitbox.height);
        // }
    }
}

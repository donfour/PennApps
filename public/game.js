
var socket = io();

function setHandlers() {
    socket.on("getCode", function(code) {
	console.log(code);
    });

    socket.on("sendAction", function(value) {

	if (player.isDead) return;

      
	if (value == "left") {
	    player.left();
	}

	if (value == "right") {
	    player.right();
	}

	if (value == "shoot") {
	    player.shoot();
	}

	
    });
}

setHandlers();
var lineHeight = 40;

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

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
    "killedGreenShip"
];

for (var i=0; i < images.length; i++)
    manager.queueDownload("img/" + images[i] + ".png");

var player = new Player(250, lineHeight * 13),
    background = new Rectangle(0, 0, canvas.width, canvas.height, new Color(0, 0, 0)),
    enemies = [],
    deaths = [],
    enemyShots = [],
    dir = "right",
    score = 0,
    lives = 3;

manager.downloadAll(function() {

});

function start()
{
    player = new Player(250, lineHeight * 13);

    for (var i = 0; i < 11; i++)
        enemies[i] = new Column(i + 1, 3);


    var Draw = setInterval(function() {

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
                        if (player.shot.rect.Intersects(e.hitbox))
                        {
                            deaths.push(new Death(e.rect.x, e.rect.y));
                            col.enemies.splice(j, 1);
                            if (col.enemies.length == 0)
                                enemies.splice(i, 1);
                            player.shot = null;
                            score += e.score;
                            break LOOP;
                        }
                    }
                }
            }
        }

        // ENEMY FIRE
        var random = Math.random();
        if (!player.isDead && random < 0.02)
        {
            var index = Math.floor(Math.random() * enemies.length),
                enemy = enemies[index].enemies[enemies[index].enemies.length - 1];
            enemyShots.push(new Shot(enemy.rect.x, enemy.rect.y));
        }

        for (var i = 0; i < enemyShots.length; i++)
        {
            enemyShots[i].rect.y += enemyShots[i].speed;

            if (enemyShots[i].rect.y > canvas.height)
            {
                enemyShots.splice(i, 1);
                i--;
                continue;
            }

            if (!player.isDead && enemyShots[i].rect.Intersects(player.rect))
            {
                player.isDead = true;
                lives--;
                deaths.push(new PlayerDeath(player.rect.x, player.rect.y - player.rect.height/2));
                enemyShots.splice(i, 1);
                i--;
                continue;
            }

            draw(enemyShots[i]);
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

        // DISPLAY SCORE
        ctx.font = "30px Geo";
        ctx.fillStyle = "white";
        ctx.fillText("SCORE", 50, 35);
        ctx.fillStyle = "#00FD10";
        ctx.fillText(score, 50, 60);

        // DISPLAY LIVES
        ctx.fillStyle = "white";
        ctx.fillText("LIVES", 455, 35);
        if (lives > 0)
            draw(new Life(450, 35));
        if (lives > 1)
            draw(new Life(490, 35));
        if (lives > 2)
            draw(new Life(530, 35));

        if (lives <= 0)
        {
            alert("Game Over");
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
        //     ctx.fillStyle = "green";
        //     ctx.fillRect(obj.hitbox.x, obj.hitbox.y, obj.hitbox.width, obj.hitbox.height);
        // }
    }
}

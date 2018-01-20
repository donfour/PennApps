Enemy = function(type, x, y)
{
    this.frames = [type + "Position1", type + "Position2"];
    this.frame = this.frames[0];
    this.frameNum = 0;
    this.rect = new Rectangle(x * lineHeight, y * lineHeight, lineHeight, lineHeight, new Color(0, 0, 255));

    // if (type == "invader1Position1")
    //     this.width = 64;
    // else if (type == "invader2Position1")
    //     this.width = 88;
    // else
    //     this.width = 96;

    this.width = 100 / 3;
    this.height = 64 / 3;

    var w;
    if (type == "invader1")
    {
        w = 64 / 3;
        this.score = 10;
    }
    else if (type == "invader2")
    {
        w = 88 / 3;
        this.score = 20;
    }
    else
    {
        w = 96 / 3;
        this.score = 40;
    }

    var a = Math.abs(this.rect.width - w) / 2 + this.rect.x,
        b = Math.abs(this.rect.height - this.height) / 2 + this.rect.y;
    this.hitbox = new Rectangle(a + 10, b + 10, w - 20, this.height - 20);
};

Column = function(x, y)
{
    this.speed = 1;
    this.frameOffset = 12;

    this.enemies = [
        new Enemy("invader1", x, y),
        new Enemy("invader2", x, y + 1),
        new Enemy("invader2", x, y + 2),
        new Enemy("invader3", x, y + 3),
        new Enemy("invader3", x, y + 4)
    ];

    this.shift = function(dir)
    {
        for (var e of this.enemies)
        {
            if (dir == "left")
            {
                e.rect.x -= this.speed;
                e.hitbox.x -= this.speed;

                e.frameNum++;
                e.frameNum %= this.frameOffset * 2;
                if (e.frameNum == this.frameOffset)
                    e.frame = e.frames[1];
                else if (e.frameNum == 0)
                    e.frame = e.frames[0];
            }
            else if (dir == "right")
            {
                e.rect.x += this.speed;
                e.hitbox.x += this.speed;

                e.frameNum++;
                e.frameNum %= this.frameOffset * 2;
                if (e.frameNum == this.frameOffset)
                    e.frame = e.frames[1];
                else if (e.frameNum == 0)
                    e.frame = e.frames[0];
            }
            else
            {
                e.rect.y += this.speed * 4;
                e.hitbox.y += this.speed * 4;
            }
        }
    };
};

Death = function(x, y)
{
    this.frame = "invaderDestroyed";
    this.rect = new Rectangle(x, y, lineHeight, lineHeight);
    this.width = 100 / 3;
    this.height = 64 / 3;

    this.lifetime = 0;
    this.maxLifetime = 10;
};

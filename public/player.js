Player = function(x, y)
{
    this.width = 90 / 3;
    this.height = 64 / 3;
    this.rect = new Rectangle(x, y, this.width, this.height, new Color(255, 0, 0));

    this.speed = 10;

    this.lives = 3;
    this.deathFrames = [];
    this.frame = "greenShip";

    this.shot = null;

    this.isDead = false;

    this.left = function()
	{
		if (this.rect.x > 0)
			this.rect.x -= this.speed;
	};

    this.right = function()
	{
		if (this.rect.x + this.rect.width < canvas.width)
			this.rect.x += this.speed;
	};

    this.shoot = function()
    {
        if (this.shot == null)
        {
            this.shot = new Shot(this.rect.x, this.rect.y);
        }
    };

    this.draw = function()
	{
		// var w = 30,
		// 	h = 32.5,
		// 	x = Math.abs(this.rect.width - w) / 2 + this.rect.x,
		//  	y = Math.abs(this.rect.height - h) / 2 + this.rect.y;
        //
		// ctx.drawImage(manager.getAsset(this.frame), x, y, w, h);
        this.rect.Draw(ctx);
	};
};

Shot = function(x, y)
{
    this.rect = new Rectangle(x, y, lineHeight, lineHeight, new Color(255, 255, 255));
    this.frame = "shot";
    this.width = 3;
    this.height = 15;

    this.speed = 10;
}

PlayerDeath = function(x, y)
{
    this.frame = "killedGreenShip";
    this.rect = new Rectangle(x, y, lineHeight, lineHeight);
    this.width = 110 / 3;
    this.height = 64 / 3;

    this.lifetime = 0;
    this.maxLifetime = 50;

    this.isPlayerDeath = true;
};

Life = function(x, y)
{
    this.frame = "greenShip";
    this.rect = new Rectangle(x, y, lineHeight, lineHeight);
    this.width = 90 / 3;
    this.height = 64 / 3;
};
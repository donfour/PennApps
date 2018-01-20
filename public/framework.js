/**
  *
  * Framework for canvas elements
  *
  */

Point = function(x, y)
{
	this.x = x;
	this.y = y;
};

Rectangle = function(x, y, w, h, color)
{
	this.x = x != null ? x : 0;
	this.y = y != null ? y : 0;
	this.width = w != null ? w : 50;
	this.height = h != null ? h : 50;

	this.color = color != null ? color : new Color(0, 0, 0, 0); // default transparent

	this.Contains = function(x, y)
	{
		if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height)
			return true;
		else
			return false;
	};

	this.Intersects = function(shape)
	{
		var offset = shape.radius != null ? shape.radius : 0;

		if (this.Contains(shape.x - offset, shape.y - offset) || this.Contains(shape.x + shape.width - offset, shape.y - offset) || this.Contains(shape.x - offset, shape.y + shape.height - offset) || this.Contains(shape.x + shape.width - offset, shape.y + shape.height - offset))
			return true;
		else if (shape.Contains(this.x - offset, this.y - offset) || shape.Contains(this.x + this.width - offset, this.y - offset) || shape.Contains(this.x - offset, this.y + this.height - offset) || shape.Contains(this.x + this.width - offset, this.y + this.height - offset))
			return true;

		return false;
	};

	this.Draw = function(ctx)
	{
		ctx.fillStyle = this.color.toStandard();
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};
};

Color = function(r, g, b, a)
{
	// default is white
	this.r = r != null ? r : 255;
	this.g = g != null ? g : 255;
	this.b = b != null ? b : 255;
	this.a = a != null ? a : 1;

	this.toStandard = function(noAlpha)
	{
		if (noAlpha == null || !noAlpha)
			return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
		else
			return "rgb("+this.r+","+this.g+","+this.b+")";
	};
};


/**
  *
  * Asset Manager for loading resources
  *
  */

AssetManager = function()
{

    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];

    this.queueDownload = function(path)
    {
        this.downloadQueue.push(path);
    };

    this.isDone = function()
    {
        return (this.downloadQueue.length == this.successCount + this.errorCount);
    };

    this.downloadAll = function(downloadCallback)
    {
        if (this.downloadQueue.length == 0)
            downloadCallback();

        for (var i=0; i < this.downloadQueue.length; i++)
        {
            var path = this.downloadQueue[i],
            img = new Image(),
            that = this;

            img.addEventListener("load", function() {
                //console.log(this.src + " is loaded");
                that.successCount++;
                if (that.isDone())
                {
                    downloadCallback();
                }
            }, false);

            img.addEventListener("error", function() {
                that.errorCount++;
                if (that.isDone())
                {
                    downloadCallback();
                }
            }, false);

            img.src = path;
            this.cache[path] = img;
        }
    };

    this.getAsset = function(path)
    {
        return this.cache[path];
    }

};

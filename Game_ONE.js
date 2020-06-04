var sketchProc=function(processingInstance){ with (processingInstance){
frameRate(60);
size(800, 500);

/*----------------------------------------------------------------------------------------------------CHANGE LOG
BEFORE NO DATE:
- changed asteroids to periodically spawn at periphery of screen
- change asteroids to be removed when too far away from screen
- realized this could mean we could hypothetically have no bounds on whole map
- it would just procedurally generate asteroids/loot wherever the ship flies
- added game over state (state 2, idk if thats ok just wanted to mess with)
- added change log

MAY 30:
- changed numAsteroids updating
- collisions working
- added sprites for asteroids and pseudo-random spawning
- changed asteroid speed determination
*/




/*----------------------------------------------------------------------------------------------------------------------------GAME STATES
0 = START
1 = LEVEL ONE
*/

var $ = 0;

//----------------------------------------------------------------------------------------------------------------------------VAR DEFINITION
var wPress = false;
var sPress = false;
var aPress = false;
var dPress = false;
var rPress = false;
var fired = false;

var mouseLeftPress = false;
var mouseRightPress = true;

var topBound = 0;
var bottomBound = 500;
var leftBound = 0;
var rightBound = 800;

var numAsteroids = 0;

var totalWidth = rightBound * 2;
var totalHeight = bottomBound * 2;

var spawnLocation = 0; //used for asteroid spawning quadrant (0 - up, 1 - left, 2 - down, 3 - right)

var score = 0;
//-------------------------------------------------------------------------------------------



//----------------------------------------------------------------------------------------------------------------------------BUTTON OBJECTS
var buttonObj = function(x, y, w, h)  {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.click = false;
};

var startBT = new buttonObj (rightBound/2, bottomBound/2, 100, 50);



//-------------------------------------------------------------------------------------------BUTTON FUNCTIONS
buttonObj.prototype.draw = function() {
	fill(255, 0, 0);
	rectMode(CENTER);
	rect(this.x, this.y, this.w, this.h);
};

buttonObj.prototype.press = function() {
	if (mouseLeftPress === true && mouseX < this.x + this.w/2 && mouseX > this.x - this.w/2 && mouseY < this.y + this.h/2 && mouseY > this.y -this.h/2) {
		this.click = true;
		println(this.click);
	}
};

//-------------------------------------------------------------------------------------------LASER FUNCTIONS
var lasers = [];

var laserObj = function(x, y, speed, angle) {
	this.x = x;
	this.y = y;
	this.speed = speed;
	this.angle = angle;
};

var drawLaser = function(laser) {
	fill(255, 0, 0);
	ellipse(laser.x, laser.y, 10, 10);
};

var updateLaser = function(laser) {
	laser.y += laser.speed * sin(laser.angle-3.14/2);
	laser.x += laser.speed * cos(laser.angle-3.14/2);
};

var checkLaserCollisions = function(laser) {
	for (var i = 0; i < numAsteroids; i++) {
		if (dist(laser.x, laser.y, asteroids[i].x, asteroids[i].y) < (asteroids[i].rad + 10)/2) {
			lasers.splice(lasers.indexOf(laser), 1);
			asteroids.splice(asteroids.indexOf(asteroids[i]), 1);
			numAsteroids--;
		}
	}
};

//----------------------------------------------------------------------------------------------------------------------------SHIP OBJECTS
var shipObj = function(x, y, speed) {
	this.x = x;
	this.y = y;
	this.speed = speed;
 	this.angle = 0;
	this.img = loadImage("blackship.jpg");
};

var ship = new shipObj(totalWidth/2, totalHeight/2, 2);

//-------------------------------------------------------------------------------------------SHIP FUNCTIONS
shipObj.prototype.draw = function() {
	pushMatrix();
	translate(ship.x, ship.y);
	rotate(this.angle);
	imageMode(CENTER);
	image(this.img, 0, 0);
	// ellipse(0, -10, 12, 12);
	// ellipse(0, 6, 20, 20);
	// ellipses used for collision detection
	popMatrix();
};

shipObj.prototype.move = function() {
	if (wPress === true) {
		this.y += this.speed * sin(this.angle-3.14/2);
    	this.x += this.speed * cos(this.angle-3.14/2);
	}

	if (sPress === true) {
		this.y -= this.speed * sin(this.angle-3.14/2);
    	this.x -= this.speed * cos(this.angle-3.14/2);
	}

	if (aPress === true) {
		this.angle -= .1;
	}

	if (dPress === true) {
    this.angle += .1;
	}

	if (rPress === true) {
		if (fired === false) {
			lasers.push(new laserObj(this.x, this.y, this.speed, this.angle));
		}
		fired = true;
	}
};

//----------------------------------------------------------------------------------------------------------------------------ASTEROID OBJECTS
var asteroidObj = function(x, y, xSpeed, ySpeed, size, isLoot) {
	this.x = x;
	this.y = y;
	this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;
	this.size = size;
	this.isLoot = isLoot;
	this.numHits = 0;

	switch(size) {
		case 1:
			this.rad = 31;
			this.img = loadImage("31x31_asteroid.png");
			break;
		case 2:
			this.rad = 41;
			this.img = loadImage("41x41_asteroid.png");
			break;
		case 3:
			this.rad = 51;
			this.img = loadImage("51x51_asteroid.png");
			break;
		case 4:
			this.rad = 71;
			this.img = loadImage("71x71_asteroid.png");
			break;
		default:
			println("shouldn't be here")
			break;
	}

	if (isLoot) {
		this.rad = 11;
		this.img = loadImage("loot_asteroid.png");
	}
	this.mass = 3.14 * pow(this.rad/2, 3);
};

var asteroids = [];


//-------------------------------------------------------------------------------------------ASTEROID FUNCTIONS
var drawAsteroid = function(asteroid) {
	fill(255, 255, 255);
	if (asteroid.isLoot) {
		fill(255, 255, 0);
	}
	ellipse(asteroid.x, asteroid.y, asteroid.rad, asteroid.rad);
	imageMode(CENTER);
	image(asteroid.img, asteroid.x, asteroid.y);
};

var asteroidUpdate = function(asteroid) {
	asteroid.x += asteroid.xSpeed;
	asteroid.y += asteroid.ySpeed;
};

var countAsteroid = function()
{
	println(asteroids.length);
};

var addAsteroid = function() {
	var size = round(random(1, 4));
	var fastSpeed = random(0, 2);
	var slowSpeed = random(-.5, .5);
	switch(spawnLocation) {
		case 0: //top of screen
			asteroids.push(new asteroidObj(random(ship.x - rightBound/2, ship.x + rightBound/2), ship.y - bottomBound/2 - 71, slowSpeed, fastSpeed, size, false));
			break;
		case 1: //left of screen
			asteroids.push(new asteroidObj(ship.x - rightBound/2 - 71, random(ship.y - bottomBound/2, ship.y + bottomBound/2), fastSpeed, slowSpeed, size, false));
			break;
		case 2: //bottom of screen
			asteroids.push(new asteroidObj(random(ship.x - rightBound/2, ship.x + rightBound/2), ship.y + bottomBound/2 + 71, slowSpeed, -fastSpeed, size, false));
			break; //right of screen
		case 3:
			asteroids.push(new asteroidObj(ship.x + rightBound/2 + 71, random(ship.y - bottomBound/2, ship.y + bottomBound/2), -fastSpeed, slowSpeed, size, true));
			spawnLocation = 0;
			break;
	}
	numAsteroids++;
	spawnLocation++;
};

var checkToRemoveAsteroid = function(asteroid) {
	if (asteroid.x > ship.x + rightBound || asteroid.x < ship.x - rightBound || asteroid.y > ship.y + bottomBound || asteroid.y < ship.y - bottomBound) {
		asteroids.splice(asteroids.indexOf(asteroid), 1);
		numAsteroids -= 1;
	}
};

var checkAllCollisions = function() {
	for(var i = 0; i < numAsteroids; i++) {
		for(var j = 0; j < numAsteroids; j++) {
			if (j != i) {
				checkAsteroidCollision(asteroids[i], asteroids[j]);
			}
		}
		checkShipCollision(asteroids[i]);
	}
};

var checkShipCollision = function(asteroid) {
	if ((dist(asteroid.x, asteroid.y, ship.x, ship.y - 10) < (asteroid.rad + 12)/2) ||
			 (dist(asteroid.x, asteroid.y, ship.x, ship.y + 6) < (asteroid.rad + 20)/2)) {
		if (!asteroid.isLoot) {
			$ = 2;
			println("Game Over");
		}
		else {
			score +=1 ;
			asteroids.splice(asteroids.indexOf(asteroid), 1);
			numAsteroids--;
		}
	}
};

var checkAsteroidCollision = function(asteroid1, asteroid2) {
	if (dist(asteroid1.x, asteroid1.y, asteroid2.x, asteroid2.y) < (asteroid1.rad + asteroid2.rad)/2) {
		var tempX = asteroid2.xSpeed * (asteroid2.mass - asteroid1.mass)/(asteroid1.mass + asteroid2.mass) + asteroid1.xSpeed * (2 * asteroid1.mass)/(asteroid1.mass + asteroid2.mass);
		var tempY = asteroid2.ySpeed * (asteroid2.mass - asteroid1.mass)/(asteroid1.mass + asteroid2.mass) + asteroid1.ySpeed * (2 * asteroid1.mass)/(asteroid1.mass + asteroid2.mass);
		asteroid1.xSpeed = asteroid1.xSpeed * (asteroid1.mass - asteroid2.mass)/(asteroid1.mass + asteroid2.mass) + asteroid2.xSpeed * (2 * asteroid2.mass)/(asteroid1.mass + asteroid2.mass);
		asteroid1.ySpeed = asteroid1.ySpeed * (asteroid1.mass - asteroid2.mass)/(asteroid1.mass + asteroid2.mass) + asteroid2.ySpeed * (2 * asteroid2.mass)/(asteroid1.mass + asteroid2.mass);
		asteroid2.xSpeed = tempX;
		asteroid2.ySpeed = tempY;
		asteroidUpdate(asteroid1);
		asteroidUpdate(asteroid2);
	}
};



//----------------------------------------------------------------------------------------------------------------------------KEY CHECKS
var keyPressed = function()
{
	if (key.toString() === "w") {
		wPress = true;
	}

	if (key.toString() === "s") {
		sPress = true;
	}

	if (key.toString() === "a") {
		aPress = true;
	}

	if (key.toString() === "d") {
		dPress = true;
	}

	if (key.toString() === "r") {
		rPress = true;
	}
};


var keyReleased = function()
{
	if (key.toString() === "w") {
		wPress = false;
	}

	if (key.toString() === "s") {
		sPress = false;
	}

	if (key.toString() === "a") {
		aPress = false;
	}

	if (key.toString() === "d") {
		dPress = false;
	}

	if (key.toString() === "r") {
		rPress = false;
		fired = false;
	}
};

var mousePressed = function()
{
	if (mouseButton === LEFT) {
		mouseLeftPress = true;
	}

	if (mouseButton === RIGHT) {
		mouseRightPress = true;
	}
};

var mouseReleased = function()
{
	if (mouseButton === LEFT) {
		mouseLeftPress = false;
	}

	if (mouseButton === RIGHT) {
		mouseRightPress = false;
	}
};



//----------------------------------------------------------------------------------------------------------------------------0 CASE FUNCTIONS
var buttonState0 = function()
{
	startBT.draw();
	startBT.press();

	if (startBT.click === true) {
		$ = 1;
	}
};



//----------------------------------------------------------------------------------------------------------------------------1 CASE FUNCTIONS
var shipState1 = function()
{
	ship.draw();
	ship.move();
};

var laserState1 = function() {
	lasers.forEach(drawLaser);
	lasers.forEach(updateLaser);
	lasers.forEach(checkLaserCollisions);
}

var asteroidState1 = function()
{
	if (frameCount%120 == 0) {
		addAsteroid();
	}

	checkAllCollisions();

	asteroids.forEach(drawAsteroid);
	asteroids.forEach(asteroidUpdate);
	asteroids.forEach(checkToRemoveAsteroid);

	// countAsteroid();
};



//----------------------------------------------------------------------------------------------------------------------------DRAW FUNCTION
var draw = function()
{
	switch($)
	{
		case 0:
			buttonState0();
			break;

		case 1:
			background(0, 0, 0);

			// score text
			fill(255, 0, 0);
			textSize(45);
			text(score, 10, 40);

			pushMatrix();
			translate(400-ship.x, 250-ship.y);
			asteroidState1();
			laserState1();
			shipState1();
			popMatrix();

			break;
		case 2:
			background(255, 255, 255);
	}
};

}};

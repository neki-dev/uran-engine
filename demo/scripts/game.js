cacheSprites([
	'space.png',
	'player.png',
	'shoot.png',
	'shoot-super.png',
	'bio.png',
	'asteroid-small.png',
	'asteroid-medium.png',
	'asteroid-big.png',
	'star.png',
	'death.png'
]);

cacheSounds([
	'shoot.wav',
	'shoot-super.wav',
	'boom.wav'
]);

createWorld('world', [ 1280, 800 ], function() {

	var SHOOTS = [],
		ASTEROIDS = [],
		STARS = [],
		DEATH = false,
		SCORE = 0,
		SUPER = false,
		BIO,
		SUPER_TIME;

	var A_DATA = [
		{
			sprite: 'asteroid-small.png',
			size: [ 80, 70 ],
			health: 100
		},
		{
			sprite: 'asteroid-medium.png',
			size: [ 100, 113 ],
			health: 180
		},
		{
			sprite: 'asteroid-big.png',
			size: [ 130, 117 ],
			health: 260
		}
	];

	createMap('space.png');
	mapAnimate('down', 4);

	var hudScore = createHud('Очки: 0', {
		toggle: true,
		position: [ 10, 24 ],
		size: 22,
		bold: true
	});

	var hudSuper = createHud({
		position: [ 10, 54 ],
		size: 22,
		bold: true
	});

	var player = createObject('Player', {
		polygons: [
			[   0,  64 ],
			[  52,  62 ],
			[  62,   0 ],
			[  72,  62 ],
			[ 128,  64 ],
			[ 128,  78 ],
			[  84,  92 ],
			[  79, 116 ],
			[  45, 116 ],
			[  40,  92 ],
			[   0,  78 ]
		],
		sprite: 'player.png',
		position: [ 640, 600 ],
		speed: 3,
		attach: true
	}).specifyPlayer();

	onKeyHas(function(key) {

		if(DEATH) {
			return;
		}

		if(key == KEYS.UP) {
			player.move('up');
		}

		if(key == KEYS.DOWN) {
			player.move('down');
		}

		if(key == KEYS.RIGHT) {
			player.move('right');
		}

		if(key == KEYS.LEFT) {
			player.move('left');
		}

	});

	onKeyDown(function(key) {

		if(DEATH) {
			return;
		}

		if(key == KEYS.SPACE) {

			playSound(SUPER ? 'shoot-super.wav' : 'shoot.wav');

			var position = player.get('position');

			SHOOTS[SHOOTS.length] = createObject('Shoot', {
				size: SUPER ? [ 4, 10 ] : [ 2, 4 ],
				sprite: SUPER ? 'shoot-super.png' : 'shoot.png',
				position: [ position.left, position.top-61 ],
				speed: 5
			});

		}

	});

	onMove(function(data) {

		if(data.object.name != 'Player') {
			if(!data.object.isVisible()) {
				data.object.destroy();
				if(BIO && !BIO.has()) {
					delete BIO;
				}
			}
		}

	});

	// FPS vars

	var frames = 0;
		startTime = Date.now(), 
		prevTime = startTime;

	// FPS hud

	var hudFPS = createHud('', {
		toggle: true,
		position: [ 10, 780 ],
		size: 18,
		color: 'rgba(255,255,255,0.7)'
	});

	//

	onWorldUpdate(function() {

		// FPS show

		var time = Date.now();
		frames++;
		if(time > prevTime+1000) {
			fps = Math.ceil((frames*1000)/(time-prevTime)*100)/100;
			prevTime = time;
			frames = 0;
     		hudFPS.setText('FPS: ' + fps);
		}

		//

		if(BIO) {
			BIO.move('down');
		}

		for(var i in SHOOTS) {
			SHOOTS[i].move('up');
		}

		for(var i in ASTEROIDS) {
			ASTEROIDS[i].move('down');
		}

		for(var i in STARS) {
			STARS[i].move('down');
		}

		if(rnd(1, 150) == 1) {

			STARS[STARS.length] = createObject('Star', {
				size: [ 12, 12 ],
				sprite: 'star.png',
				position: [ rnd(100, 1180), -5 ],
				speed: rnd(1, 3)
			});

		}

		if(rnd(1, 350) == 1 && !BIO) {

			BIO = createObject('Bio', {
				size: [ 24, 24 ],
				sprite: 'bio.png',
				position: [ rnd(100, 1180), -11 ],
				speed: rnd(2, 3)
			});

		}

		if(rnd(1, 40) == 1) {

			var data = A_DATA[rnd(0, A_DATA.length-1)];

			ASTEROIDS[ASTEROIDS.length] = createObject('Asteroid', {
				size: data.size,
				sprite: data.sprite,
				position: [ rnd(100, 1180), -(data.size[1]/2-1) ],
				speed: rnd(1, 3),
				health: data.health
			});

		}
		
	});

	onCollision('Shoot', function(data) {

		if(data.actor.name == 'Asteroid') {

			data.actor.giveDamage(player, SUPER ? 9999 : rnd(20, 50));

			data.object.destroy();
			SHOOTS.splice(SHOOTS.indexOf(data.object), 1);

		}

	});

	onCollision('Asteroid', function(data) {

		if(data.actor.name == 'Player' && !DEATH) {
			
			playSound('boom.wav');

			player.set({
				sprite: 'death.png'
			});

			DEATH = true;

			setTimeout(function() {

				player.destroy();

				createHud('ВЫ ПРОИГРАЛИ', {
					toggle: true,
					position: [ 620, 400 ],
					size: 50,
					color: '#fff',
					bold: true,
					align: 'center'
				});

			}, 2000);

		}

	});

	onCollision('Star', function(data) {

		if(data.actor.name == 'Player' && !DEATH) {

			data.object.destroy();

			SCORE += 3;

			hudScore.setText('Очки: ' + SCORE);

		}

	});

	onCollision('Bio', function(data) {

		if(data.actor.name == 'Player' && !DEATH) {

			data.object.destroy();

			SUPER = true;

			hudSuper.setText('Супер режим: 10 сек').set({
				toggle: true
			});

			SUPER_TIME = 10;
			setTimeout(superTimeout, 1000);

		}

	});

	onDeath('Asteroid', function(data) {

		data.object.destroy();

		SCORE++;

		hudScore.setText('Очки: ' + SCORE);

	});

	function superTimeout() {

		SUPER_TIME--;

		if(SUPER_TIME == 0) {
			hudSuper.set({
				toggle: false
			});
			SUPER = false;
		} else {
			hudSuper.setText('Супер режим: ' + SUPER_TIME + ' сек');
			setTimeout(superTimeout, 1000);
		}

	}

	function rnd(min, max) {

		return Math.round(min-0.5+Math.random()*(max-min+1));

	}

});
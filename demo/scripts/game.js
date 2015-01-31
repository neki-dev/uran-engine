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

	drawMap('space.png');

	var DEATH = false,
		SCORE = 0,
		SUPER = false,
		BIO,
		SUPER_TIME;

	var A_DATA = [
		{
			sprite: 'asteroid-small.png',
			height: 70,
			health: 100,
			polygons: [
				[ 59, 1 ],
				[ 77, 29 ],
				[ 79, 50 ],
				[ 50, 69 ],
				[ 2, 49 ],
				[ 18, 22 ],
				[ 12, 12 ],
				[ 24, 6 ],
				[ 28, 12 ]
			]
		},
		{
			sprite: 'asteroid-medium.png',
			height: 113,
			health: 180,
			polygons: [
				[ 37, 1 ],
				[ 87, 11 ],
				[ 96, 30 ],
				[ 99, 83 ],
				[ 83, 110 ],
				[ 34, 110 ],
				[ 5, 87 ],
				[ 14, 52 ],
				[ 1, 28 ],
				[ 5, 13 ]
			]
		},
		{
			sprite: 'asteroid-big.png',
			height: 117,
			health: 260,
			polygons: [
				[ 37, 1 ],
				[ 93, 11 ],
				[ 129, 43 ],
				[ 104, 108 ],
				[ 72, 116 ],
				[ 39, 95 ],
				[ 22, 100 ],
				[ 2, 81 ],
				[ 4, 40 ]
			]
		}
	];

	var hudScore = createHud('ОЧКИ: 0', {
		position: {
			x: 10,
			y: 13
		},
		size: 22,
		style: 'bold'
	});

	var hudSuper = createHud({
		toggle: false,
		position: {
			x: 10,
			y: 43
		},
		size: 22,
		style: 'bold'
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
		position: {
			x: 640,
			y: 600
		},
		velocity: 3,
		fasten: true
	})
	.animate('player.png', 5, 5, true);

	onKeyHas(function(key) {

		if(DEATH) {
			return;
		}

		if(key == KEYS.UP) {
			player.move(90);
		}

		if(key == KEYS.DOWN) {
			player.move(270);
		}

		if(key == KEYS.RIGHT) {
			player.move(0);
		}

		if(key == KEYS.LEFT) {
			player.move(180);
		}

	});

	onKeyDown(function(key) {

		if(DEATH) {
			return;
		}

		if(key == KEYS.SPACE) {

			playSound(SUPER ? 'shoot-super.wav' : 'shoot.wav');

			var positionPlayer = player.get('position');
			positionPlayer.y -= 61;

			createObject('Shoot', {
				size: (SUPER ? { 
					width: 4, 
					height: 10 
				} : { 
					width: 2, 
					height: 4 
				}),
				sprite: SUPER ? 'shoot-super.png' : 'shoot.png',
				position: positionPlayer,
				velocity: 7
			});

		}

	});

	onMove(function(data) {

		if(this.name != 'Player') {

			if(!this.isVisible()) {

				this.destroy();

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
		position: {
			x: 10,
			y: 772
		},
		size: 18,
		color: 'rgba(255,255,255,0.7)'
	});

	//

	onUpdate(function(data) {

		switch(this.name) {

			case 'Star':
			case 'Bio':

				this.move(270);

			break;

			case 'Shoot':

				this.move(90);

			break;

			case 'Asteroid':

				var angle = this.get('angle');

				this.move(270)
				.set({
					angle: angle + this.getData('rotate')
				});

			break;

		}

	});

	onWorldUpdate(function() {

		// FPS show

		var time = Date.now();
		frames++;
		if(time > prevTime + 1000) {
			fps = Math.ceil((frames * 1000) / (time - prevTime) * 100) / 100;
			prevTime = time;
			frames = 0;
     		hudFPS.setText('FPS: ' + fps);
		}

		//

		moveMap(270, 4);

		if(random(1, 150) == 1) {

			createObject('Star', {
				size: {
					width: 12,
					height: 12
				},
				sprite: 'star.png',
				position: {
					x: random(100, 1180), 
					y: -5
				},
				velocity: random(1, 3)
			});

		}

		if(random(1, 350) == 1 && !BIO) {

			BIO = createObject('Bio', {
				size: {
					width: 24,
					height: 24
				},
				sprite: 'bio.png',
				position: {
					x: random(100, 1180), 
					y: -11
				},
				velocity: random(2, 3)
			});

		}

		if(random(1, 40) == 1) {

			var data = A_DATA[random(0, A_DATA.length - 1)];

			createObject('Asteroid', {
				sprite: data.sprite,
				position: {
					x: random(100, 1180), 
					y: -data.height / 2 + 1
				},
				velocity: random(1, 3),
				polygons: data.polygons,
				health: data.health,
				angle: random(0, 90)
			})
			.setData('rotate', random(-10, 10) / 20);

		}
		
	});

	onCollision('Shoot', function(data) {

		this.destroy();

		if(data.object.name == 'Asteroid') {

			data.object.giveDamage(player, SUPER ? 9999 : random(20, 50));

		}

	});

	onCollision('Asteroid', function(data) {

		if(data.object.name == 'Player' && !DEATH) {
			
			playSound('boom.wav');

			player.animate('death.png', 5, 2);

			DEATH = true;

			setTimeout(function() {

				player.destroy();

				createHud('ВЫ ПРОИГРАЛИ', {
					position: {
						x: 620,
						y: 400
					},
					size: 50,
					color: '#fff',
					style: 'bold',
					align: 'center'
				});

			}, 2000);

		}

	});

	onCollision('Star', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			this.destroy();

			SCORE += 3;

			hudScore.setText('Очки: ' + SCORE);

		}

	});

	onCollision('Bio', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			this.destroy();

			SUPER = true;

			hudSuper.setText('Супер режим: 10 сек').set({
				toggle: true
			});

			SUPER_TIME = 10;
			setTimeout(superTimeout, 1000);

		}

	});

	onDeath('Asteroid', function(data) {

		this.destroy();

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

});
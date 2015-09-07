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
	'restart.png',
	'death.png'
]);

cacheSounds([
	'shoot.wav',
	'shoot-super.wav',
	'boom.wav'
]);

createWorld('world', CONST.FULL_SIZE, function() {

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

	var hudScore = createHud({
		text: 'ОЧКИ • 0',
		position: {
			x: 10,
			y: 13
		},
		textSize: 22,
		textStyle: 'bold'
	});

	var hudSuper = createHud({
		toggle: false,
		position: {
			x: 10,
			y: 43
		},
		textSize: 22,
		textStyle: 'bold'
	});

	var hudLoose = createHud({
		text: 'ВЫ ПРОИГРАЛИ',
		position: {
			x: WORLD.element.width / 2,
			y: WORLD.element.height / 2
		},
		textSize: 50,
		textStyle: 'bold',
		align: 'center',
		toggle: false
	});

	var player = createPlayer();

	var hudRestart = createHud({
		text: 'РЕСТАРТ',
		position: {
			x: -10,
			y: 13
		},
		textSize: 12,
		textStyle: 'bold',
		sprite: 'restart.png',
		align: 'right',
		textPadding: [ 7, 5, 4, 5 ],
		background: '#0066CC'
	});

	// FPS vars

	var frames = 0;
		startTime = Date.now(), 
		prevTime = startTime;

	// FPS hud

	var hudFPS = createHud({
		position: {
			x: 10,
			y: -25
		},
		textSize: 18,
		textColor: '#fff',
		opacity: 0.6
	});

	//

	onKeyHas(function(key) {

		if(DEATH) {
			return;
		}

		if(key == KEYS.LETTER['w']) {
			player.move(90);
		}

		if(key == KEYS.LETTER['s']) {
			player.move(270);
		}

		if(key == KEYS.LETTER['d']) {
			player.move(0);
		}

		if(key == KEYS.LETTER['a']) {
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
				size: SUPER ?
					{ 
						width: 4, 
						height: 10 
					} :
					{ 
						width: 2, 
						height: 4 
					},
				sprite: SUPER ?
					'shoot-super.png' :
					'shoot.png',
				position: positionPlayer,
				velocity: 7
			});



		}

	});

	onObjectMove(function(data) {

		if(this.name != 'Player') {

			if(!this.onMap()) {

				this.destroy();

				if(BIO && !there(BIO)) {
					delete BIO;
				}

			}

		}

	});

	onObjectUpdate(function(data) {

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
     		hudFPS.set({
     			text: 'FPS: ' + fps
     		});
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
					y: -5,
					stuck: true
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
					y: -11,
					stuck: true
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
					y: -data.height / 2 + 1,
					stuck: true
				},
				velocity: random(1, 3),
				polygons: data.polygons,
				health: data.health,
				angle: random(0, 90)
			})
			.setData('rotate', random(-10, 10) / 20);

		}
		
	});

	onObjectCollision('Shoot', function(data) {

		this.destroy();

		if(data.object.name == 'Asteroid') {

			data.object.giveDamage(player, SUPER ? 9999 : random(20, 50));

		}

	});

	onObjectCollision('Asteroid', function(data) {

		if(data.object.name == 'Player' && !DEATH) {
			
			playSound('boom.wav');

			player.animate('death.png', 5, 2);

			DEATH = true;

			setTimeout(function() {

				if(DEATH) {

					player.destroy();

					hudLoose.set({
						toggle: true
					});

				}

			}, 2000);

		}

	});

	onObjectCollision('Star', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			this.destroy();

			SCORE += 3;

			hudScore.set({
				text: 'ОЧКИ • ' + SCORE
			});

		}

	});

	onObjectCollision('Bio', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			this.destroy();

			SUPER = true;

			hudSuper.set({
				text: 'Супер режим: 10 сек',
				toggle: true
			});

			SUPER_TIME = 10;
			setTimeout(superTimeout, 1000);

		}

	});

	onObjectDeath('Asteroid', function(data) {

		this.destroy();

		SCORE++;
		hudScore.set({
			text: 'ОЧКИ • ' + SCORE
		});

	});

	onMouseEnterHud(hudRestart, function() {

		setCursor('pointer');

		this.set({
			sprite: null
		});

	});

	onMouseLeaveHud(hudRestart, function() {

		setCursor('default');

		this.set({
			sprite: 'restart.png'
		});

	});

	onClickedHud(hudRestart, function() {

		SCORE = 0;
		hudScore.set({
			text: 'ОЧКИ • 0'
		});

		hudSuper.set({
			toggle: false
		});
		SUPER = false;

		hudLoose.set({
			toggle: false
		});

		DEATH = false;

		BIO = false;

		var objects = selectObjects();

		for(var i in objects) {
			objects[i].destroy();
		}

		player = createPlayer();

	});

	function superTimeout() {

		if(!SUPER) {
			return;
		}

		SUPER_TIME--;

		if(SUPER_TIME == 0) {
			hudSuper.set({
				toggle: false
			});
			SUPER = false;
		} else {
			hudSuper.set({
				text: 'Супер режим: ' + SUPER_TIME + ' сек'
			});
			setTimeout(superTimeout, 1000);
		}

	}

	function createPlayer() {

		return createObject('Player', {
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
				x: WORLD.element.width / 2,
				y: WORLD.element.height / 2
			},
			velocity: 3,
			fasten: true
		})
		.animate('player.png', 5, 5, true);

	}

});
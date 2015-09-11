var DEATH = false,
	SCORE = 0,
	SUPER = false,
	BIO,
	SUPER_TIME;

var asteroid_data = [
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

var frames = 0;
	startTime = Date.now(), 
	prevTime = startTime;

// Кеширование файлов игры

cacheSprites([
	'space.png',
	'player.png',
	'bio.png',
	'asteroid-small.png',
	'asteroid-medium.png',
	'asteroid-big.png',
	'star.png',
	'restart.png',
	'restart-hover.png',
	'explode.png',
	'shot.png',
	'shot-super.png'
]);

cacheSounds([
	'shot.wav',
	'shot-super.wav',
	'boom.wav'
]);

// Создание мира

createWorld('world', CONST.FULL_SIZE, function() {

	// Отрисовка карты

	drawMap('space.png');

	// Создание HUD

	var hud = createAllHud();

	// Создание игрока

	var player = createPlayer();

	// Передвижение игрока

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

	// Выстрелы

	onKeyDown(function(key) {

		if(DEATH) {
			return;
		}

		if(key == KEYS.SPACE) {

			playSound(SUPER ? 'shot-super.wav' : 'shot.wav', 0.2);

			var positionPlayer = player.get('position');
			positionPlayer.y -= 60;

			createObject('Shot', {
				size: { 
					width: SUPER ? 32 : 16, 
					height: 32 
				},
				position: positionPlayer,
				velocity: 7
			})
			.animate(SUPER ? 'shot-super.png' : 'shot.png', SUPER ? 24 : 16, 5, true);

		}

	});

	// Удаление объектов за пределами мира

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

	// Движение объектов

	onObjectUpdate(function(data) {

		switch(this.name) {

			case 'Star':
				this.move(270);
			break;

			case 'Shot':
				this.move(90);
			break;

			case 'Asteroid':
			case 'Bio':
				this.move(270)
				.set({
					angle: this.get('angle') + this.getData('rotate')
				});
			break;

		}

	});

	//

	onWorldUpdate(function() {

		// Отображение FPS

		var time = Date.now();
		frames++;
		if(time > prevTime + 1000) {
			fps = Math.ceil((frames * 1000) / (time - prevTime) * 100) / 100;
			prevTime = time;
			frames = 0;
     		hud.fps.set({
     			text: 'FPS: ' + fps
     		});
		}

		// Движение карты

		moveMap(270, 4);

		// Создание объектов

		if(random(1, 150) == 1) {
			createStar();
		}

		if(random(1, 350) == 1 && !BIO) {
			BIO = createBio();
		}

		if(random(1, 40) == 1) {
			createAsteroid();
		}
		
	});

	// Событие попадание выстрела

	onObjectCollision('Shot', function(data) {

		if(data.object.name == 'Asteroid') {
			this.destroy();
			data.object.giveDamage(player, SUPER ? 9999 : random(20, 50));
		}

	});

	// Событие удара астероида

	onObjectCollision('Asteroid', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			DEATH = true;
			
			playSound('boom.wav', 0.2);
			player.animate('explode.png', 10, 5);

			setTimeout(function() {
				if(DEATH) {
					player.destroy();
					hud.loose.set({
						toggle: true
					});
				}
			}, 1000);

		}

	});

	// Событие подбора звезды

	onObjectCollision('Star', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			this.destroy();

			SCORE += 3;

			hud.score.set({
				text: 'ОЧКИ • ' + SCORE
			});

		}

	});

	// Событие подбора Bio

	onObjectCollision('Bio', function(data) {

		if(data.object.name == 'Player' && !DEATH) {

			this.destroy();

			SUPER = true;

			hud.super.set({
				text: 'ФАЕРБОЛ • 10',
				toggle: true
			});

			SUPER_TIME = 10;
			setTimeout(superTimeout, 1000);

		}

	});

	// Событие смерти астероида

	onObjectDeath('Asteroid', function(data) {

		this.destroy();

		SCORE++;
		hud.score.set({
			text: 'ОЧКИ • ' + SCORE
		});

	});

	// Эффект наведения на кнопку рестарта

	onMouseEnterHud(hud.restart, function() {

		setCursor('pointer');
		this.set({
			sprite: 'restart-hover.png'
		});

	});

	onMouseLeaveHud(hud.restart, function() {

		setCursor('default');
		this.set({
			sprite: 'restart.png'
		});

	});

	// Событие клика по кнопке рестарта

	onClickedHud(hud.restart, function() {

		SCORE = 0;
		SUPER = false;
		DEATH = false;
		BIO = false;

		hud.score.set({
			text: 'ОЧКИ • 0'
		});
		hud.super.set({
			toggle: false
		});
		hud.loose.set({
			toggle: false
		});

		var objects = selectObjects();
		for(var i in objects) {
			objects[i].destroy();
		}

		player = createPlayer();

	});

	//

	function superTimeout() {

		if(!SUPER) {
			return;
		}

		SUPER_TIME--;

		if(SUPER_TIME == 0) {
			hud.super.set({
				toggle: false
			});
			SUPER = false;
		} else {
			hud.super.set({
				text: 'ФАЕРБОЛ • ' + SUPER_TIME
			});
			setTimeout(superTimeout, 1000);
		}

	}

	//

	function createBio() {

		return createObject('Bio', {
			size: {
				width: 32,
				height: 12
			},
			sprite: 'bio.png',
			position: {
				x: random(100, WORLD.element.width - 100), 
				y: -5,
				stuck: true
			},
			velocity: random(2, 3)
		})
		.setData('rotate', random(-10, 10) / 10);

	}

	function createAsteroid() {

		var data = asteroid_data[random(0, asteroid_data.length - 1)];

		return createObject('Asteroid', {
			sprite: data.sprite,
			position: {
				x: random(100, WORLD.element.width - 100), 
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

	function createStar() {

		return createObject('Star', {
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

	function createPlayer() {

		return createObject('Player', {
			polygons: [
				[ 0, 52 ],
				[ 17, 46 ],
				[ 17, 28 ],
				[ 28, 14 ],
				[ 28, 0 ],
				[ 46, 0 ],
				[ 46, 14 ],
				[ 57, 28 ],
				[ 57, 46 ],
				[ 74, 52 ],

				[ 74, 82 ],
				[ 44, 85 ],
				[ 48, 100 ],
				[ 24, 100 ],
				[ 30, 85 ],
				[ 0, 82 ]
			],
			position: {
				x: WORLD.element.width / 2,
				y: WORLD.element.height / 2
			},
			velocity: 3,
			fasten: true
		})
		.animate('player.png', 15, 1, true);

	}

	function createAllHud() {

		return {

			score: createHud({
				text: 'ОЧКИ • 0',
				position: {
					x: 10,
					y: 13
				},
				textSize: 22,
				textStyle: 'bold'
			}),

			super: createHud({
				toggle: false,
				position: {
					x: 10,
					y: 43
				},
				textSize: 22,
				textStyle: 'bold'
			}),

			loose: createHud({
				text: 'ВЫ ПРОИГРАЛИ',
				position: {
					x: WORLD.element.width / 2,
					y: WORLD.element.height / 2
				},
				textSize: 50,
				textStyle: 'bold',
				align: 'center',
				toggle: false
			}),

			restart: createHud({
				text: 'РЕСТАРТ',
				position: {
					x: -10,
					y: 13
				},
				textSize: 13,
				textStyle: 'bold',
				sprite: 'restart.png',
				align: 'right',
				textPadding: [ 11, 13, 9, 13 ]
			}),

			fps: createHud({
				position: {
					x: 10,
					y: -25
				},
				textSize: 18,
				textColor: '#fff',
				opacity: 0.6
			})

		};

	}

});
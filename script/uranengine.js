/*

	uranEngine 
	Текущая версия: 1.6.0
	_______________________________

	uranengine.ru
	github.com/Essle/uranEngine

*/

/*
**	Константы
*/

var CONST = {

	RAD: Math.PI / 180,
	DEG: 180 / Math.PI,
	FRAMES: 60,
	DEBUG: false

};

/*
**	Массив объектов
*/

var OBJECTS = [];

/*
**	Класс объекта
*/

function _object(name) {

	this.name = name;
	this.id = new Date().getTime();

	this.data = {
		polygons: {
			points: [],
			size: {
				height: 0,
				width: 0
			},
			collision: []
		},
		collision: [],
		offset: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		animate: {
			sprite: null,
			infinity: false,
			animated: false,
			getFrame: 1,
			pause: 5,
			update: 0,
			frames: 0
		},
		angle: 0,
		sprite: null,
		mouse: false
	};

	this.property = {
		fasten: false,
		sprite: null,
		health: 100,
		collision: false,
		velocity: {
			x: 2,
			y: 2
		},
		polygons: [],
		position: {
			x: 0,
			y: 0
		},
		angle: 0,
		size: {
			height: 0,
			width: 0
		},
		data: []
	};
	
	OBJECTS.push(this);

}

/*
**	Функции объекта
*/

_object.prototype = {

	// Удаление объекта

	destroy: function() {

		if(!this.has()) {
			return;
		}

		OBJECTS.splice(OBJECTS.indexOf(this), 1);

		delete this.property;
		delete this.data;

	},

	// Проверка на существование объекта

	has: function() {

		for(var i in OBJECTS) {
			if(OBJECTS[i] == this) {
				return true;
			}
   		}

   		return false;

	},

	//

	set: function(property) {

		if(!this.has()) {
			return undefined;
		}

		// Установка размеров объекта

		if(typeof property.size == 'object') {

			this.property.size = {
				width: (typeof property.size.width == 'number') ? property.size.width << 0 : this.property.size.width,
				height: (typeof property.size.height == 'number') ? property.size.height << 0 : this.property.size.height
			};

			__updateOffset(this);

			if(!this.property.polygons.length) {

				this.data.polygons.size = this.property.size;

				this.property.polygons = [
					[ 0, 0 ],
					[ this.property.size.width, 0 ],
					[ this.property.size.width, this.property.size.height ],
					[ 0, this.property.size.height ]
				];

				this.data.polygons.points = clone(this.property.polygons);
				this.data.polygons.points[this.property.polygons.length] = this.data.polygons.points[0];

			} else {

				__updatePolygons(this);

			}

		}

		// Установка полигонов объекта

		if(typeof property.polygons == 'object') {

			if(property.polygons.length < 3) {
				console.warn('Количество полигонов не может быть меньше трех');
			} else {

				this.data.polygons.size = {
					width: 0,
					height: 0
				};

				for(var k in property.polygons) {

					this.data.polygons.size = {
						width: (this.data.polygons.size.width < property.polygons[k][0]) ? property.polygons[k][0] : this.data.polygons.size.width,
						height: (this.data.polygons.size.height < property.polygons[k][1]) ? property.polygons[k][1] : this.data.polygons.size.height
					};

				}

				this.property.polygons = clone(property.polygons);
	
				this.data.polygons.points = clone(property.polygons);
				this.data.polygons.points[this.property.polygons.length] = this.data.polygons.points[0];

				if(this.property.size.width === 0 && this.property.size.height === 0) {

					this.property.size = this.data.polygons.size;

					__updateOffset(this);

				}

				__updatePolygons(this);

			}

		}

		// Установка угла поворота объекта

		if(typeof property.angle == 'number') {

			if(property.angle > 360) {
				property.angle -= 360;
			} else if(property.angle < -360) {
				property.angle += 360;
			}

			this.data.angle = (this.property.angle = property.angle) * -CONST.RAD;

			__updatePolygons(this);

		}

		// Установка спрайта объекта

		if(typeof property.sprite == 'string') {

			if(!WORLD.sprites[property.sprite]) {
				console.warn('Спрайт ' + property.sprite + ' не найден в кэше игры');
			} else {

				this.property.sprite = property.sprite;
				this.data.sprite = WORLD.sprites[property.sprite];

				this.data.animate.animated = false;

			}

		}

		// Установка удара объекта

		if(typeof property.collision == 'boolean') {

			this.property.collision = property.collision;

		}

		// Установка привязки объекта к миру

		if(typeof property.fasten == 'boolean') {

			this.property.fasten = property.fasten;

		}

		// Установка жизни объекта

		if(typeof property.health == 'number') {

			var previonHealth = this.property.health;
			this.property.health = property.health;

			if(this.property.health <= 0) {

				this.property.health = 0;

				if(previonHealth > 0) {
					EVENTS['onDeath'].run(this);
				}

			}

		}

		// Установка скорости объекта

		if(typeof property.velocity == 'object') {
		
			this.property.velocity = {
				x: (typeof property.velocity.x == 'number') ? property.velocity.x : this.property.velocity.x,
				y: (typeof property.velocity.y == 'number') ? property.velocity.y : this.property.velocity.y
			};

		} else if(typeof property.velocity == 'number') {
		
			this.property.velocity = {
				x: property.velocity,
				y: property.velocity
			};

		}

		// Установка координат объекта

		if(typeof property.position == 'object') {

			this.property.position = {
				x: (typeof property.position.x == 'number') ? property.position.x << 0 : this.property.position.x,
				y: (typeof property.position.y == 'number') ? property.position.y << 0 : this.property.position.y
			};

			__updateOffset(this);

		}

		return this;

	},

	// Получение свойства объекта

	get: function(key) {

		return clone(this.property[key]);

	},

	// Клонирование объекта

	clone: function() {

		return new _object(this.name).set(this.property);

	},

	// Проверка на видимость объекта в мире

	isVisible: function() {

		if(!this.has()) {
			return false;
		}

		return !(
			this.data.offset.right < 0 ||
			this.data.offset.left > WORLD.element.width ||
			this.data.offset.bottom < 0 ||
			this.data.offset.top > WORLD.element.height
		);

	},

	// Установка урона объекту

	giveDamage: function(forward, damage) {

		if(!this.has()) {
			return undefined;
		}

		if(this.property.health > 0) {

			if(!damage) {
				damage = forward;
				forward = null;
			}

			this.property.health -= damage;

			if(this.property.health <= 0) {

				this.property.health = 0;

				EVENTS['onDeath'].run(this, {
					object: forward
				});

			}

		}

		return this;

	},

	// Установка дополнительного значения объекта

	setData: function(key, value) {

		if(!this.has()) {
			return undefined;
		}

		if(typeof value == 'undefined') {
			delete this.property.data[key];
		} else {
			this.property.data[key] = value;
		}

		return this;

	},

	// Получение дополнительного значения объекта

	getData: function(key) {

		if(!this.has()) {
			return undefined;
		}

		return this.property.data[key];

	},

	// Устанавливает анимацию объекту

	animate: function(sprite, frames, pause, infinity) {

		if(!WORLD.sprites[sprite]) {
			console.warn('Спрайт ' + sprite + ' не найден в кэше игры');
		} else {
			
			this.data.animate = {
				sprite: WORLD.sprites[sprite],
				infinity: (typeof pause == 'boolean') ? pause : infinity,
				animated: true,
				getFrame: 1,
				pause: (typeof pause == 'number') ? pause : this.data.animate.pause,
				update: 0,
				frames: frames
			};

		}

		return this;

	},

	// Передвижение объекта по углу

	move: function(angle) {

		if(!this.has()) {
			return undefined;
		}
		
		var newPosition = {
			x: (this.property.position.x + this.property.velocity.x * Math.cos(angle * -CONST.RAD)) << 0,
			y: (this.property.position.y + this.property.velocity.y * Math.sin(angle * -CONST.RAD)) << 0
		};

		if(this.property.fasten) {

			var offset = __getObjectPositionOffset(this, newPosition);

			for(var k in this.data.polygons.points) {

				if(
					offset.left + this.data.polygons.points[k][0] < 0 || 
					offset.left + this.data.polygons.points[k][0] > WORLD.element.width || 
					offset.top + this.data.polygons.points[k][1] < 0 || 
					offset.top + this.data.polygons.points[k][1] > WORLD.element.height
				) {
					return this;
				}

			}

		}

		if(__isObjectCollision(this, newPosition)) {
			return this;
		}

		if(!this.has()) {
			return undefined;
		}

		this.set({
			position: newPosition
		});

		EVENTS['onMove'].run(this, {
			position: newPosition
		});

		return this;

	},

	// Передвижение объекта по координатам

	moveTo: function(x, y) {

		if(!this.has()) {
			return undefined;
		}

		this.move(anglePoint(this.property.position.x, this.property.position.y, x, y));

		return this;

	}

};

/*
**	Системные функции объекта
*/

function __isObjectCollision(object, position) {

	var collision = false;

	for(var i in OBJECTS) {

		if(object == OBJECTS[i]) {
			continue;
		}

		if(__isObjectInObject(position, object, OBJECTS[i])) {
			
			if(OBJECTS[i].property.collision) {
				collision = true;
			}

			if(!object.data.collision[OBJECTS[i].id]) {

				object.data.collision[OBJECTS[i].id] = true;

				if(!OBJECTS[i].property.collision) {
					EVENTS['onEnter'].run(object, {
						object: OBJECTS[i]
					});
				}

				if(object.has() && OBJECTS[i].has()) {
					EVENTS['onCollision'].run(object, {
						object: OBJECTS[i]
					});
				}

			}

		} else {

			if(object.data.collision[OBJECTS[i].id]) {

				delete object.data.collision[OBJECTS[i].id];

				if(!OBJECTS[i].property.collision) {
					EVENTS['onLeave'].run(object, {
						object: OBJECTS[i]
					});
				}

			}

		}

		if(!object.has()) {
			return true;
		}

	}

	return collision;

}

function __isObjectInObject(position, object, getObject) {

	var offset = __getObjectPositionOffset(object, position);

	if(offset.left > getObject.data.offset.right || offset.right < getObject.data.offset.left ||
	   offset.top > getObject.data.offset.bottom || offset.bottom < getObject.data.offset.top) {
		return false;
	}

	for(var k = 0; k < object.data.polygons.points.length - 1; ++k) {

		var A_start = [
				offset.left + object.data.polygons.points[k][0], 
				offset.top + object.data.polygons.points[k][1]
			], 
			A_end = [
				offset.left + object.data.polygons.points[k + 1][0], 
				offset.top + object.data.polygons.points[k + 1][1]
			];

		for(var j = 0; j < getObject.data.polygons.points.length - 1; ++j) {

			var B_start = [
					getObject.data.offset.left + getObject.data.polygons.points[j][0], 
					getObject.data.offset.top + getObject.data.polygons.points[j][1]
				],
				B_end = [
					getObject.data.offset.left + getObject.data.polygons.points[j + 1][0], 
					getObject.data.offset.top + getObject.data.polygons.points[j + 1][1]
				];

			if(

				((B_start[1] - B_end[1]) * A_start[0] +
				(B_end[0] - B_start[0]) * A_start[1] +
				(B_start[0] * B_end[1] - B_end[0] * B_start[1]) === 0 ||
				(B_start[1] - B_end[1]) * A_end[0] +
				(B_end[0] - B_start[0]) * A_end[1] +
				(B_start[0] * B_end[1] - B_end[0] * B_start[1]) === 0) ||

				((((B_end[0] - B_start[0]) * (A_start[1] - B_start[1]) - (B_end[1] - B_start[1]) * (A_start[0] - B_start[0])) *
				((B_end[0] - B_start[0]) * (A_end[1] - B_start[1]) - (B_end[1] - B_start[1]) * (A_end[0] - B_start[0]))) < 0 && 
				(((A_end[0] - A_start[0]) * (B_start[1] - A_start[1]) - (A_end[1] - A_start[1]) * (B_start[0] - A_start[0])) *
				((A_end[0] - A_start[0]) * (B_end[1] - A_start[1]) - (A_end[1] - A_start[1]) * (B_end[0] - A_start[0]))) < 0)

			) {

				// UNSTABLE

				if(object.data.polygons.collision[getObject.id] != j) {

					object.data.polygons.collision[getObject.id] = j;

					EVENTS['onPolygon'].run(object, {
						object: getObject,
						polygon: j
					});

				}

				return true;

			}

		}

		if(isPositionInObject(
			offset.left + object.data.polygons.points[k][0], 
			offset.top + object.data.polygons.points[k][1], 
			getObject)
		) {
			return true;
		}

	}

	return false;

}

function __getObjectPositionOffset(object, position) {

	return {
		left: position.x - object.property.size.width / 2,
		right: position.x + object.property.size.width / 2,
		top: position.y - object.property.size.height / 2,
		bottom: position.y + object.property.size.height / 2
	};

}

function __updateOffset(object) {

	object.data.offset = {
		left: object.property.position.x - object.property.size.width / 2,
		right: object.property.position.x + object.property.size.width / 2,
		top: object.property.position.y - object.property.size.height / 2,
		bottom: object.property.position.y + object.property.size.height / 2
	};

}

function __updatePolygons(object) {

	var scale = [
		object.data.polygons.size.width / object.property.size.width,
		object.data.polygons.size.height / object.property.size.height
	];

	var center = [
		object.property.size.width / 2,
		object.property.size.height / 2
	];

	var sin = Math.sin(object.data.angle),
		cos = Math.cos(object.data.angle);

	var temp = [];

	for(var k in object.property.polygons) {

		temp = [
			(object.property.polygons[k][0] / scale[0]) - center[0],
			(object.property.polygons[k][1] / scale[1]) - center[1]
		];

		object.data.polygons.points[k] = [
			(center[0] + (temp[0] * cos - temp[1] * sin)) << 0,
			(center[1] + (temp[0] * sin + temp[1] * cos)) << 0
		];

	}

	object.data.polygons.points[object.property.polygons.length] = object.data.polygons.points[0];

}

/*
**	Свойства мира
*/

var WORLD = {

	canvas: null,
	element: null,
	sounds: [],
	sprites: [],
	map: null

};

/*
**	Функции мира
*/

// Создание мира

function createWorld(canvasID, size, callback) {

	window.onload = function() {

		WORLD.element = document.getElementById(canvasID);

		if(!WORLD.element) {
			console.error('Canvas с id `' + canvasID + '` не найден');
			return;
		}

		WORLD.canvas = WORLD.element.getContext('2d');

		WORLD.element.width = size[0];
		WORLD.element.height = size[1];

		WORLD.canvas.textBaseline = 'hanging';
		WORLD.canvas.lineWidth = 2;
		WORLD.canvas.strokeStyle = '#ff0000';

		(function loop(){
			renderFrames(loop);
			__updateWorld();
		})();

		callback();

	};

}

// Создание объекта

function createObject(name, property) {

	if(typeof name == 'object') {
		property = name;
		name = 'Undefined';
	}

	var object = new _object(name);

	if(property) {
		object.set(property);
	}

	return object;

}

// Выборка объектов

function selectObjects(name) {

	var result = [];

	for(var i in OBJECTS) {

		if(OBJECTS[i].name == name) {
			result.push(OBJECTS[i]);
		}

	}

	return result;

}

// Создание HUD

function createHud(text, property) {

	if(typeof text == 'object') {
		property = text;
		text = '';
	}

	var hud = new _hud(text);

	if(property) {
		hud.set(property);
	}

	return hud;

}

// Кэширование спрайтов

function cacheSprites(path, sprites) {

	if(!sprites) {
		sprites = path;
		path = 'data/sprites/';
	} else {
		path += '/';
	}

	for(var i in sprites) {

		WORLD.sprites[sprites[i]] = new Image();
		WORLD.sprites[sprites[i]].src = path + sprites[i];
		WORLD.sprites[sprites[i]].onerror = function() {
			delete WORLD.sprites[sprites[i]];
		};

	}

}

// Кэширование звуков

function cacheSounds(path, sounds) {

	if(!sounds) {
		sounds = path;
		path = 'data/sounds/';
	} else {
		path += '/';
	}

	for(var i in sounds) {

		WORLD.sounds[sounds[i]] = new Audio();
		WORLD.sounds[sounds[i]].src = path + sounds[i];
		WORLD.sounds[sounds[i]].onerror = function() {
			delete WORLD.sounds[sounds[i]];
		};

	}

}

// Воспроизведение звука

function playSound(sound) {

	if(!WORLD.sounds[sound]) {
		console.warn('Звук ' + sound + ' не найден в кэше игры');
		return;
	}

	WORLD.sounds[sound].load();
	WORLD.sounds[sound].play();

}

// Создание карты

function drawMap(sprite) {

	if(!WORLD.sprites[sprite]) {
		console.warn('Спрайт ' + sprite + ' не найден в кэше игры');
		return;
	}

	WORLD.map = {
		sprite: WORLD.sprites[sprite],
		position: [
			[ 0, 0 ]
		]
	};

	WORLD.map.update = function() {

		for(var i = 0; i < 2; ++i) {

			var mapWidth = (WORLD.element.width - WORLD.map.position[i][0] > WORLD.element.width) ? 
					WORLD.element.width : 
					WORLD.element.width - WORLD.map.position[i][0],
				mapHeight = (WORLD.element.height - WORLD.map.position[i][1] > WORLD.element.height) ? 
					WORLD.element.height : 
					WORLD.element.height - WORLD.map.position[i][1];

			if(WORLD.map.position[i]) {
				WORLD.canvas.drawImage(
					WORLD.map.sprite, 0, 0,
					mapWidth, 
					mapHeight,
					WORLD.map.position[i][0], 
					WORLD.map.position[i][1],
					mapWidth, 
					mapHeight
				);
			}

		}

	};

}

// Движение карты

function moveMap(angle, speed) {

	if(!WORLD.map) {
		return;
	}

	if(!WORLD.map.position[1]) {
		if(angle == 180) {
			WORLD.map.position[1] = [ WORLD.element.width, 0 ];
		} else if(angle === 0) {
			WORLD.map.position[1] = [ -WORLD.element.width, 0 ];
		} else if(angle == 90) {
			WORLD.map.position[1] = [ 0, WORLD.element.height ];
		} else if(angle == 270) {
			WORLD.map.position[1] = [ 0, -WORLD.element.height ];
		} else {
			console.warn('');
			return;
		}
	}

	var x = (speed * Math.cos(angle * -CONST.RAD)) << 0,
		y = (speed * Math.sin(angle * -CONST.RAD)) << 0;

	var i;

	for(i = 0; i < 2; ++i) {
		WORLD.map.position[i][0] += x;
		WORLD.map.position[i][1] += y;
	}

	for(i = 0; i < 2; ++i) {

		if(WORLD.map.position[i][0] + WORLD.element.width <= 0) {
			WORLD.map.position[i][0] = WORLD.element.width;
		} else if(WORLD.map.position[i][0] >= WORLD.element.width) {
			WORLD.map.position[i][0] = -WORLD.element.width;
		}

		if(WORLD.map.position[i][1] + WORLD.element.height <= 0) {
			WORLD.map.position[i][1] = WORLD.element.height;
		} else if(WORLD.map.position[i][1] >= WORLD.element.height) {
			WORLD.map.position[i][1] = -WORLD.element.height;
		}

	}

}

// Проверка находимости HUD в указанных координатах

function isPositionInHud(x, y, hud) {

	return (
		x > hud.data.offset.left && 
		x < hud.data.offset.right && 
		y > hud.data.offset.top && 
		y < hud.data.offset.bottom
	);

}

// Проверка находимости объекта в указанных координатах

function isPositionInObject(x, y, object) {

	var inside = false,
		dx = [],
		dy = [];

	for(var i = 0, j = object.data.polygons.points.length - 1; i < object.data.polygons.points.length; j = i++) {

		dx = [
			object.data.offset.left + object.data.polygons.points[i][0],
			object.data.offset.left + object.data.polygons.points[j][0]
		];
		dy = [
			object.data.offset.top + object.data.polygons.points[i][1],
			object.data.offset.top + object.data.polygons.points[j][1]
		];

		if(((dy[0] > y) != (dy[1] > y)) && (x < (dx[1] - dx[0]) * (y - dy[0]) / (dy[1] - dy[0]) + dx[0])) {
			inside = !inside;
		} 

	}

	return inside;

}

/*
**	Системные функции мира
*/

function __updateWorld() {

	WORLD.canvas.clearRect(0, 0, WORLD.element.width, WORLD.element.height);

	if(WORLD.map) {
		WORLD.map.update();
	}

	WORLD.canvas.beginPath();

	var i;

	for(i in OBJECTS) {

		EVENTS['onUpdate'].run(OBJECTS[i], {
			object: OBJECTS[i]
		});

	}

	for(i in OBJECTS) {

		if(!OBJECTS[i].isVisible() || OBJECTS[i].property.size.width === 0 || OBJECTS[i].property.size.height === 0) {
			continue;
		}

		WORLD.canvas.translate(OBJECTS[i].property.position.x, OBJECTS[i].property.position.y);
		WORLD.canvas.rotate(OBJECTS[i].data.angle);

		if(OBJECTS[i].data.animate.animated) {

			WORLD.canvas.drawImage(
				OBJECTS[i].data.animate.sprite, 
				OBJECTS[i].property.size.width * (OBJECTS[i].data.animate.getFrame - 1), 
				0,
				OBJECTS[i].data.animate.sprite.width / OBJECTS[i].data.animate.frames, 
				OBJECTS[i].data.animate.sprite.height,
				-OBJECTS[i].property.size.width / 2, 
				-OBJECTS[i].property.size.height / 2,
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height
			);

			OBJECTS[i].data.animate.update++;

			if(OBJECTS[i].data.animate.update == OBJECTS[i].data.animate.pause) {

				if(OBJECTS[i].data.animate.getFrame == OBJECTS[i].data.animate.frames) {
					if(OBJECTS[i].data.animate.infinity) {
						OBJECTS[i].data.animate.getFrame = 1;
					}
				} else {
					OBJECTS[i].data.animate.getFrame++;
				}

				OBJECTS[i].data.animate.update = 0;

			}

		} else if(OBJECTS[i].data.sprite) {

			WORLD.canvas.drawImage(
				OBJECTS[i].data.sprite, 
				-OBJECTS[i].property.size.width / 2, 
				-OBJECTS[i].property.size.height / 2,
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height
			);

		}

		WORLD.canvas.rotate(-OBJECTS[i].data.angle);
		WORLD.canvas.translate(-OBJECTS[i].property.position.x, -OBJECTS[i].property.position.y);

		if(OBJECTS[i].data.polygons.points.length > 2 && CONST.DEBUG) {

			for(var k = 0; k < OBJECTS[i].data.polygons.points.length - 1; ++k) {
				WORLD.canvas.moveTo(
					OBJECTS[i].data.offset.left + OBJECTS[i].data.polygons.points[k][0], 
					OBJECTS[i].data.offset.top + OBJECTS[i].data.polygons.points[k][1]
				);
				WORLD.canvas.lineTo(
					OBJECTS[i].data.offset.left + OBJECTS[i].data.polygons.points[k + 1][0], 
					OBJECTS[i].data.offset.top + OBJECTS[i].data.polygons.points[k + 1][1]
				);
			}

		}

	}

	WORLD.canvas.stroke();

	for(i in HUD) {

		if(!HUD[i].text.length || !HUD[i].property.toggle) {
			continue;
		}

		WORLD.canvas.textAlign = HUD[i].property.align;
		WORLD.canvas.font = HUD[i].property.style + ' ' + HUD[i].property.size + 'px ' + HUD[i].property.font;
		WORLD.canvas.fillStyle = HUD[i].property.color;
		WORLD.canvas.fillText(HUD[i].text, HUD[i].property.position.x, HUD[i].property.position.y);

		__updateHudScale(HUD[i]);

	}

	for(i in keyController.has) {
		EVENTS['onKeyHas'].run(i);
	}

	EVENTS['onWorldUpdate'].run();

}

/*
**	Массив событий
*/

var EVENT_LIST = [

	'onMove', 
	'onCollision', 
	'onDeath', 
	'onEnter', 
	'onLeave',
	'onMouseEnter',
	'onMouseLeave',
	'onClicked',
	'onUpdate',
	'onPolygon',

	'onWorldClicked',
	'onWorldUpdate',

	'onKeyHas',
	'onKeyDown',
	'onKeyUp',
	'onMouseMove',

	'onHudMouseEnter',
	'onHudMouseLeave',
	'onHudClicked'

];

var EVENTS = [];

/*
**	Класс события
*/

function _event(key) {

	if(EVENTS[key]) {
		return;
	}

	this.key = key;

	this.callback = [];
	this.target = [];

	this.save = {
		params: [],
		target: []
	};

	EVENTS[key] = this;

	window[key] = function(target, callback) {
		EVENTS[key].init(target, callback);
	};

}

/*
**	Функции события
*/

_event.prototype = {

	// Добавления обработчика события

	init: function(target, callback) {

		if(!callback) {
			callback = target;
			target = null;
		}

		this.callback.push(callback);
		this.target.push(target);

		for(var i in this.save.target) {

			this.run(this.save.target[i], this.save.params[i]);

			delete this.save.target[i];
			delete this.save.params[i];

		}

	},

	// Вызов события

	run: function(target, params) {

		if(!this.callback.length) {

			this.save.params.push(params);
			this.save.target.push(target);

			return;

		}

		var i;

		if(!params) {

			for(i in this.callback) {

				this.callback[i](target);

			}

		} else {

			for(i in this.callback) {

				if(this.target[i] === target || this.target[i] === target.name || !this.target[i]) {
					this.callback[i].apply(target, [ params ]);
				}

			}

		}

	}

};

/*
**	Инициализация событий
*/

for(var i in EVENT_LIST) {
	new _event(EVENT_LIST[i]);
}

/*
**	Массив HUD
*/

var HUD = [];

/*
**	Класс HUD
*/

function _hud(text) { 

	this.text = text || '';

	this.data = {
		offset: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		mouse: false
	};

	this.property = {
		toggle: true,
		align: 'left',
		color: '#fff',
		size: 14,
		font: 'Arial',
		style: '',
		position: {
			x: 5,
			y: 20
		}
	}

	HUD.push(this);

}

/*
**	Функции HUD
*/

_hud.prototype = {

	// Удаление HUD

	destroy: function() {

		HUD.splice(HUD.indexOf(this), 1);

		delete this.text;
		delete this.property;

	},

	// Обновление текста

	setText: function(text) {

		this.text = text || '';

		return this;

	},

	// Обновление изображения

	setImage: function(image) {

		// TODO

	},

	//

	set: function(property) {

		// Установка цвета шрифта

		if(typeof property.color == 'string') {

			this.property.color = property.color;
			
		}

		// Установка размера шрифта

		if(typeof property.size == 'number') {

			this.property.size = property.size;
			
		}

		// Установка названия шрифта

		if(typeof property.font == 'string') {

			this.property.font = property.font;
			
		}

		// Установка стиля шрифта

		if(typeof property.style == 'string') {

			this.property.style = property.style;
			
		}

		// Установка позиционирования

		if(typeof property.align == 'string') {

			this.property.align = property.align;
			
		}

		// Установка позиции

		if(typeof property.position == 'object') {

			this.property.position = {
				x: (typeof property.position.x == 'number') ? property.position.x << 0 : this.property.position.x,
				y: (typeof property.position.y == 'number') ? property.position.y << 0 : this.property.position.y
			};
			
		}

		// Установка видимости

		if(typeof property.toggle == 'boolean') {

			this.property.toggle = property.toggle;
			
		}

		return this;

	},

	// Получение свойства HUD

	get: function(key) {

		return clone(this.property[key]);

	}

};

/*
**	Системные функции HUD
*/

function __updateHudScale(hud) {

	var width = WORLD.canvas.measureText(hud.text).width;

	switch(hud.property.align) {

		case 'left':
			hud.data.offset.left = hud.property.position.x;
		break;

		case 'center':
			hud.data.offset.left = hud.property.position.x - width / 2;
		break;

		case 'right':
			hud.data.offset.left = -hud.property.position.x;
		break;

	}

	hud.data.offset = {
		top: hud.property.position.y,
		bottom: hud.property.position.y + hud.property.size * 0.8,
		left: hud.data.offset.left,
		right: hud.data.offset.left + width
	};

}

/*
**	Константы клавиш
*/

var KEYS = {

	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	ALT: 18,
	ESC: 27,
	SPACE: 32,
	CTRL: 17,
	DOWN: 83,
	UP: 87,
	RIGHT: 68,
	LEFT: 65

};

/*
**	Свойства контроллера клавиш
*/

var keyController = {

	has: []

};

/*
**	Контроллер клавиш
*/

window.onmousemove = function(event) {

	EVENTS['onMouseMove'].run({
		x: event.pageX,
		y: event.pageY
	});

	for(i in OBJECTS) {

		if(isPositionInObject(event.pageX, event.pageY, OBJECTS[i])) {

			if(!OBJECTS[i].data.mouse) {

				OBJECTS[i].data.mouse = true;

				EVENTS['onMouseEnter'].run(OBJECTS[i], {
					position: {
						x: event.pageX,
						y: event.pageY
					}
				});

			}

		} else if(OBJECTS[i].data.mouse) {

			OBJECTS[i].data.mouse = false;

			EVENTS['onMouseLeave'].run(OBJECTS[i], {
				position: {
					x: event.pageX,
					y: event.pageY
				}
			});

		}

	}

	for(i in HUD) {

		if(isPositionInHud(event.pageX, event.pageY, HUD[i])) {

			if(!HUD[i].data.mouse) {

				HUD[i].data.mouse = true;

				EVENTS['onHudMouseEnter'].run(HUD[i], {
					position: {
						x: event.pageX,
						y: event.pageY
					}
				});

			}

		} else if(HUD[i].data.mouse) {

			HUD[i].data.mouse = false;

			EVENTS['onHudMouseLeave'].run(HUD[i], {
				position: {
					x: event.pageX,
					y: event.pageY
				}
			});

		}

	}

};

window.onkeydown = function(event) {

	if(!__isGameKey(event.keyCode) || keyController.has[event.keyCode]) {
		return;
	}

	keyController.has[event.keyCode] = true;

	EVENTS['onKeyDown'].run(event.keyCode);

};

window.onkeyup = function(event) {

	if(!__isGameKey(event.keyCode) || !keyController.has[event.keyCode]) {
		return;
	}

	delete keyController.has[event.keyCode];

	EVENTS['onKeyUp'].run(event.keyCode);

};

window.onclick = function(event) {

	EVENTS['onWorldClicked'].run({
		position: {
			x: event.pageX,
			y: event.pageY
		}
	});

	var i;

	for(i in OBJECTS) {

		if(isPositionInObject(event.pageX, event.pageY, OBJECTS[i])) {

			EVENTS['onClicked'].run(OBJECTS[i], {
				position: {
					x: event.pageX,
					y: event.pageY
				}
			});

		}

	}

	for(i in HUD) {

		if(isPositionInHud(event.pageX, event.pageY, HUD[i])) {

			EVENTS['onHudClicked'].run(HUD[i], {
				position: {
					x: event.pageX,
					y: event.pageY
				}
			});

		}

	}

};

/*
**	Системные функции контроллера клавиш
*/

function __isGameKey(code) {

	for(var i in KEYS) {

		if(code == KEYS[i]) {
			return true;
		}

	}

	return false;

}

/*
**	Рендеринг
*/

window.renderFrames = (function() {

	return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	window.oRequestAnimationFrame || 
	window.msRequestAnimationFrame || 
	function(callback) {

		window.setTimeout(callback, 1000 / CONST.FRAMES);

	};

})();

/*
**	Прочие функции
*/

function random(min, max, noround) {

	var r = min - 0.5 + Math.random() * (max - min + 1);

	return noround ? r : Math.round(r);

}

function vectorLength(a, b) {

	return Math.sqrt(Math.pow((b.x || b[0]) - (a.x || a[0]), 2) + Math.pow((b.y || b[1]) - (a.y || a[1]), 2));

}

function anglePoint(fromX, fromY, x, y) {

	var angle = Math.atan2(fromY - y, x - fromX) * CONST.DEG;

	return (angle < 0) ? angle + 360 : angle;

}

function clone(object) {

	if(typeof object != 'object') {
		return object;
	}

	var temp = new object.constructor(); 

	for(var k in object) {
		temp[k] = (typeof object[k] == 'object') ? clone(object[k]) : object[k];
	}

	return temp;

}
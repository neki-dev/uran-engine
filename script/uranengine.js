/*

	uranEngine 
	Текущая версия: 1.7.2
	_______________________________

	uranengine.ru
	github.com/Essle/uranEngine

*/

/*
**	Константы
*/

var CONST = {

	FRAMES: 60,
	RAD: Math.PI / 180,
	DEG: 180 / Math.PI,
	FONTHEIGHT: 0.8,
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
				width: (typeof property.size.width == 'number') ?
					property.size.width << 0 :
					this.property.size.width,
				height: (typeof property.size.height == 'number') ?
					property.size.height << 0 :
					this.property.size.height
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
						width: (this.data.polygons.size.width < property.polygons[k][0]) ?
							property.polygons[k][0] :
							this.data.polygons.size.width,
						height: (this.data.polygons.size.height < property.polygons[k][1]) ?
							property.polygons[k][1] :
							this.data.polygons.size.height
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
				x: (typeof property.velocity.x == 'number') ?
					property.velocity.x :
					this.property.velocity.x,
				y: (typeof property.velocity.y == 'number') ?
					property.velocity.y :
					this.property.velocity.y
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
				x: (typeof property.position.x == 'number') ?
					property.position.x << 0 :
					this.property.position.x,
				y: (typeof property.position.y == 'number') ?
					property.position.y << 0 :
					this.property.position.y
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
				infinity: (typeof pause == 'boolean') ?
					pause :
					infinity,
				animated: true,
				getFrame: 1,
				pause: (typeof pause == 'number') ?
					pause :
					this.data.animate.pause,
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

	},

	// Проверка вхождения объекта в указанные координаты

	isLocated: function(x, y) {

		var inside = false,
			dx = [],
			dy = [];

		for(var i = 0, j = this.data.polygons.points.length - 1; i < this.data.polygons.points.length; j = i++) {

			dx = [
				this.data.offset.left + this.data.polygons.points[i][0],
				this.data.offset.left + this.data.polygons.points[j][0]
			];
			dy = [
				this.data.offset.top + this.data.polygons.points[i][1],
				this.data.offset.top + this.data.polygons.points[j][1]
			];

			if(((dy[0] > y) != (dy[1] > y)) && (x < (dx[1] - dx[0]) * (y - dy[0]) / (dy[1] - dy[0]) + dx[0])) {
				inside = !inside;
			} 

		}

		return inside;

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

		if(getObject.isLocated(offset.left + object.data.polygons.points[k][0], offset.top + object.data.polygons.points[k][1])) {
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

		__bindController();

		(function loop(){
			__renderFrames(loop);
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

		if(OBJECTS[i].name == name || typeof name == 'undefined') {
			result.push(OBJECTS[i]);
		}

	}

	return result;

}

// Создание HUD

function createHud(property) {

	var hud = new _hud();

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

// Изменение курсора

function setCursor(type) {

	WORLD.element.style.cursor = type;

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

		if(!HUD[i].property.text || !HUD[i].property.toggle) {
			continue;
		}

		if(HUD[i].property.background) {
			WORLD.canvas.fillStyle = HUD[i].property.background;
			WORLD.canvas.fillRect(
				HUD[i].data.position.x, 
				HUD[i].data.position.y, 
				HUD[i].data.size.width, 
				HUD[i].data.size.height
			);
		}

		if(HUD[i].data.sprite) {
			WORLD.canvas.drawImage(
				HUD[i].data.sprite,
				HUD[i].data.position.x, 
				HUD[i].data.position.y, 
				HUD[i].data.size.width, 
				HUD[i].data.size.height
			);
		}

		WORLD.canvas.textAlign = HUD[i].property.align;
		WORLD.canvas.font = HUD[i].property.textStyle + ' ' + HUD[i].property.textSize + 'px ' + HUD[i].property.textFont;
		WORLD.canvas.fillStyle = HUD[i].property.textColor;
		WORLD.canvas.fillText(
			HUD[i].property.text, 
			HUD[i].property.position.x + HUD[i].data.offsetText.x, 
			HUD[i].property.position.y + HUD[i].data.offsetText.y
		);

	}

	for(i in keyHas) {
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

	'onWorldUpdate',

	'onKeyHas',
	'onKeyDown',
	'onKeyUp',

	'onMouseClicked',
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

	this.id = new Date().getTime();

	this.data = {
		mouse: false,
		position: {
			x: 0,
			y: 0
		},
		size: {
			width: 0,
			height: 0
		},
		sprite: null,
		offsetText: {
			x: 0,
			y: 0
		}
	};

	this.property = {
		text: null,
		textColor: '#fff',
		textSize: 14,
		textFont: 'Arial',
		textStyle: '',
		textPadding: [ 
			0, 0, 0, 0
		],
		sprite: null,
		toggle: true,
		align: 'left',
		background: null,
		position: {
			x: 0,
			y: 0
		},
		size: {
			width: 'auto',
			height: 'auto'
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

		delete this.data;
		delete this.property;

	},

	//

	set: function(property) {

		// Установка текста

		if(typeof property.text == 'string') {

			this.property.text = property.text;
			
		}

		// Установка цвета шрифта

		if(typeof property.textColor == 'string') {

			this.property.textColor = property.textColor;
			
		}

		// Установка размера шрифта

		if(typeof property.textSize == 'number') {

			this.property.textSize = property.textSize;
			
		}

		// Установка названия шрифта

		if(typeof property.textFont == 'string') {

			this.property.textFont = property.textFont;
			
		}

		// Установка стиля шрифта

		if(typeof property.textStyle == 'string') {

			this.property.textStyle = property.textStyle;
			
		}

		// Установка видимости

		if(typeof property.toggle == 'boolean') {

			this.property.toggle = property.toggle;
			
		}

		// Установка фона

		if(typeof property.background == 'string') {

			this.property.background = property.background;
			
		}

		// Установка изображения

		if(typeof property.sprite == 'string') {

			if(!WORLD.sprites[property.sprite]) {
				console.warn('Спрайт ' + property.sprite + ' не найден в кэше игры');
			} else {

				this.property.sprite = property.sprite;
				this.data.sprite = WORLD.sprites[property.sprite];

			}

		}

		// Установка отступа текста

		if(typeof property.textPadding == 'object') {

			if(property.textPadding.length != 4) {
				console.warn('Неверный формат отступов текста');
			} else {

				this.property.textPadding = property.textPadding;

			}
			
		}

		// Установка позиционирования

		if(typeof property.align == 'string') {

			if(property.align != 'left' && property.align != 'center' && property.align != 'right') {
				console.warn('Неверный тип позиционирования HUD');
			} else {

				this.property.align = property.align;

			}	
			
		}

		// Установка позиции

		if(typeof property.position == 'object') {

			this.property.position = {
				x: (typeof property.position.x == 'number') ?
					property.position.x << 0 :
					this.property.position.x,
				y: (typeof property.position.y == 'number') ?
					property.position.y << 0 :
					this.property.position.y
			};
			
		}

		// Установка размера

		if(typeof property.size == 'object') {

			this.property.size = {
				width: (typeof property.size.width == 'number') ?
					property.size.width << 0 :
					(property.size.width == 'auto') ?
						'auto' :
						this.property.size.width,
				height: (typeof property.size.height == 'number') ?
					property.size.height << 0 :
					(property.size.height == 'auto') ?
						'auto' :
						this.property.size.height
			};
			
		}

		__updateHudSize(this, this.property.size);
		__updateHudPosition(this);

		return this;

	},

	// Получение свойства HUD

	get: function(key) {

		return clone(this.property[key]);

	},

	// Проверка вхождения HUD в указанные координаты

	isLocated: function(x, y) {

		return (
			x > this.data.position.x && 
			x < this.data.position.x + this.data.size.width && 
			y > this.data.position.y && 
			y < this.data.position.y + this.data.size.height
		);

	}

};

/*
**	Системные функции HUD
*/

function __updateHudSize(hud, size) {

	if(typeof size.width == 'number') {

		hud.data.size.width = clone(size.width) + hud.property.textPadding[3] + hud.property.textPadding[1];

	} else if(size.width == 'auto') {

		WORLD.canvas.font = hud.property.textStyle + ' ' + hud.property.textSize + 'px ' + hud.property.textFont;
		hud.data.size.width = WORLD.canvas.measureText(hud.property.text).width + hud.property.textPadding[3] + hud.property.textPadding[1];

	}

	if(typeof size.height == 'number') {

		hud.data.size.height = clone(size.height) + hud.property.textPadding[0] + hud.property.textPadding[2];

	} else if(size.height == 'auto') {

		hud.data.size.height = hud.property.textSize * CONST.FONTHEIGHT + hud.property.textPadding[0] + hud.property.textPadding[2];

	}

}

function __updateHudPosition(hud) {

	var positionX = 0,
		offsetX;

	switch(hud.property.align) {

		case 'left':
			positionX = hud.property.position.x;
			offsetX = hud.property.textPadding[3];
		break;

		case 'center':
			positionX = hud.property.position.x - hud.data.size.width / 2;
			offsetX = 0;
		break;

		case 'right':
			positionX = hud.property.position.x - hud.data.size.width;
			offsetX = -hud.property.textPadding[3];
		break;

	}

	hud.data.position = {
		x: positionX,
		y: hud.property.position.y
	};

	hud.data.offsetText = {
		x: offsetX,
		y: hud.property.textPadding[0]
	};

}

/*
**	Константы клавиш
*/

var KEYS = {

	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	CAPSLOCK: 20,
	ESCAPE: 27,
	SPACE: 32,
	PAGEUP: 33,
	PAGEDOWN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	INSERT: 45,
	DELETE: 46,

	NUMBER: {
		'0': 48,
		'1': 49,
		'2': 50,
		'3': 51,
		'4': 52,
		'5': 53,
		'6': 54,
		'7': 55,
		'8': 56,
		'9': 57
	},

	F: {
		'1': 112,
		'2': 113,
		'3': 114,
		'4': 115,
		'5': 116,
		'6': 117,
		'7': 118,
		'8': 119,
		'9': 120,
		'10': 121,
		'11': 122,
		'12': 123	
	},

	LETTER: {
		'a': 65,
		'b': 66,
		'c': 67,
		'd': 68,
		'e': 69,
		'f': 70,
		'g': 71,
		'h': 72,
		'i': 73,
		'j': 74,
		'k': 75,
		'l': 76,
		'm': 77,
		'n': 78,
		'o': 79,
		'p': 80,
		'q': 81,
		'r': 82,
		's': 83,
		't': 84,
		'u': 85,
		'v': 86,
		'w': 87,
		'x': 88,
		'y': 89,
		'z': 90
	}
	

};

/*
**	Свойства контроллера клавиш
*/

var keyHas = [];

/*
**	Контроллер клавиш
*/

function __bindController() {

	document.addEventListener('keydown', function(event) {

		if(!__isGameKey(event.keyCode) || keyHas[event.keyCode]) {
			return;
		}

		keyHas[event.keyCode] = true;

		EVENTS['onKeyDown'].run(event.keyCode);

	});

	document.addEventListener('keyup', function(event) {

		if(!__isGameKey(event.keyCode) || !keyHas[event.keyCode]) {
			return;
		}

		delete keyHas[event.keyCode];

		EVENTS['onKeyUp'].run(event.keyCode);

	});

	WORLD.element.addEventListener('mousemove', function(event) {

		var currentPosition = {
			x: event.pageX - WORLD.element.offsetLeft,
			y: event.pageY - WORLD.element.offsetTop
		};

		EVENTS['onMouseMove'].run({
			position: currentPosition
		});

		for(i in OBJECTS) {

			if(OBJECTS[i].isLocated(event.pageX, event.pageY)) {

				if(!OBJECTS[i].data.mouse) {

					OBJECTS[i].data.mouse = true;

					EVENTS['onMouseEnter'].run(OBJECTS[i], {
						position: currentPosition
					});

				}

			} else if(OBJECTS[i].data.mouse) {

				OBJECTS[i].data.mouse = false;

				EVENTS['onMouseLeave'].run(OBJECTS[i], {
					position: currentPosition
				});

			}

		}

		for(i in HUD) {

			if(HUD[i].isLocated(event.pageX, event.pageY)) {

				if(!HUD[i].data.mouse) {

					HUD[i].data.mouse = true;

					EVENTS['onHudMouseEnter'].run(HUD[i], {
						position: currentPosition
					});

				}

			} else if(HUD[i].data.mouse) {

				HUD[i].data.mouse = false;

				EVENTS['onHudMouseLeave'].run(HUD[i], {
					position: currentPosition
				});

			}

		}

	});

	WORLD.element.addEventListener('click', function(event) {

		var currentPosition = {
			x: event.pageX - WORLD.element.offsetLeft,
			y: event.pageY - WORLD.element.offsetTop
		};

		EVENTS['onMouseClicked'].run({
			position: currentPosition
		});

		var i;

		for(i in OBJECTS) {

			if(OBJECTS[i].isLocated(event.pageX, event.pageY)) {

				EVENTS['onClicked'].run(OBJECTS[i], {
					position: currentPosition
				});

			}

		}

		for(i in HUD) {

			if(HUD[i].isLocated(event.pageX, event.pageY)) {

				EVENTS['onHudClicked'].run(HUD[i], {
					position: currentPosition
				});

			}

		}

	});

}

/*
**	Системные функции контроллера клавиш
*/

function __isGameKey(code) {

	for(var i in KEYS) {

		if(typeof KEYS[i] == 'number') {

			if(code == KEYS[i]) {
				return true;
			}

		} else {

			for(var j in KEYS[i]) {

				if(code == KEYS[i][j]) {
					return true;
				}

			}

		}

	}

	return false;

}

/*
**	Рендеринг
*/

window.__renderFrames = (function() {

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

	return noround ?
		r :
		Math.round(r);

}

function vectorLength(a, b) {

	return Math.sqrt(Math.pow((b.x || b[0]) - (a.x || a[0]), 2) + Math.pow((b.y || b[1]) - (a.y || a[1]), 2));

}

function anglePoint(fromX, fromY, x, y) {

	var angle = Math.atan2(fromY - y, x - fromX) * CONST.DEG;

	return (angle < 0) ?
		angle + 360 :
		angle;

}

function clone(object) {

	if(typeof object != 'object') {
		return object;
	}

	var temp = new object.constructor(); 

	for(var k in object) {
		temp[k] = (typeof object[k] == 'object') ?
			clone(object[k]) :
			object[k];
	}

	return temp;

}
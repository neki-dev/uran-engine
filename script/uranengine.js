/*

	uranEngine 
	Текущая версия: 1.8.1
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
	DEBUG: false,
	FULL_SIZE: 'fs'

};

/*
**	Приватные глобальные переменные
*/

var lastId = 0,
	onceLog = [];

/*
**	Массив объектов
*/

var OBJECTS = [];

/*
**	Класс объекта
*/

function _object(name) {

	this.type = 'object';
	this.name = name;
	this.id = ++lastId;

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
		background: null,
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
		toggle: true,
		angle: 0,
		opacity: 1,
		size: {
			height: 0,
			width: 0
		},
		data: [],
		index: 1
	};
	
	OBJECTS.push(this);
	__sortByIndex(OBJECTS);

}

/*
**	Функции объекта
*/

_object.prototype = {

	// Удаление объекта

	destroy: function() {

		OBJECTS.splice(OBJECTS.indexOf(this), 1);

		clearObject(this);

	},

	//

	set: function(property) {

		// Установка размеров

		if(typeof property.size == 'object') {

			this.property.size = {
				width: (typeof property.size.width == 'number') ?
					property.size.width << 0 :
					this.property.size.width,
				height: (typeof property.size.height == 'number') ?
					property.size.height << 0 :
					this.property.size.height
			};

			__updateObjectOffset(this);

			if(!this.property.polygons.length) {

				this.data.polygons.size = this.property.size;

				this.property.polygons = [
					[ 0, 0 ],
					[ this.property.size.width, 0 ],
					[ this.property.size.width, this.property.size.height ],
					[ 0, this.property.size.height ]
				];

				this.data.polygons.points = cloneObject(this.property.polygons);
				this.data.polygons.points[this.property.polygons.length] = this.data.polygons.points[0];

			} else {

				__updateObjectPolygons(this);

			}

		}

		// Установка полигонов

		if(typeof property.polygons == 'object') {

			if(property.polygons.length < 3) {
				console.warn('Количество полигонов не может быть меньше трех');
			} else {

				this.data.polygons.size = {
					width: 0,
					height: 0
				};

				for(var i = 0; i < property.polygons.length; ++i) {

					this.data.polygons.size = {
						width: (this.data.polygons.size.width < property.polygons[i][0]) ?
							property.polygons[i][0] :
							this.data.polygons.size.width,
						height: (this.data.polygons.size.height < property.polygons[i][1]) ?
							property.polygons[i][1] :
							this.data.polygons.size.height
					};

				}

				this.property.polygons = cloneObject(property.polygons);
	
				this.data.polygons.points = cloneObject(property.polygons);
				this.data.polygons.points[this.property.polygons.length] = this.data.polygons.points[0];

				if(this.property.size.width === 0 && this.property.size.height === 0) {

					this.property.size = this.data.polygons.size;

					__updateObjectOffset(this);

				}

				__updateObjectPolygons(this);

			}

		}

		// Установка угла поворота

		if(typeof property.angle == 'number') {

			if(property.angle > 360) {
				property.angle -= 360;
			} else if(property.angle < -360) {
				property.angle += 360;
			}

			this.data.angle = (this.property.angle = property.angle) * -CONST.RAD;

			__updateObjectPolygons(this);

		}

		// Установка спрайта

		if(typeof property.sprite == 'string') {

			if(!WORLD.sprites[property.sprite]) {
				console.warn('Спрайт ' + property.sprite + ' не найден в кэше игры');
			} else {

				this.property.sprite = property.sprite;
				this.data.sprite = WORLD.sprites[property.sprite];

				this.data.animate.animated = false;

			}

		}

		// Установка фона

		if(typeof property.background == 'string') {

			this.property.background = property.background;
			
		} else if(property.background === null) {

			this.property.background = null;

		}

		// Установка осязаемости

		if(typeof property.collision == 'boolean') {

			this.property.collision = property.collision;

		}

		// Установка видимости

		if(typeof property.toggle == 'boolean') {

			this.property.toggle = property.toggle;
			
		}

		// Установка непрозрачности

		if(typeof property.opacity == 'number') {

			this.property.opacity = property.opacity;
			
		}

		// Установка привязки к миру

		if(typeof property.fasten == 'boolean') {

			this.property.fasten = property.fasten;

		}

		// Установка индекса поверхности

		if(typeof property.index == 'number') {

			this.property.index = property.index;

			__sortByIndex(OBJECTS);

		}

		// Установка жизни

		if(typeof property.health == 'number') {

			var previonHealth = this.property.health;
			this.property.health = property.health;

			if(this.property.health <= 0) {

				this.property.health = 0;

				if(previonHealth > 0) {
					EVENTS['onObjectDeath'].run(this);
				}

			}

		}

		// Установка скорости

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

		// Установка координат

		if(typeof property.position == 'object') {

			this.property.position = {
				x: (typeof property.position.x == 'number') ?
					((property.position.x < 0 && !property.position.stuck) ?
						(WORLD.element.width + property.position.x) << 0 :
						property.position.x << 0) :
					this.property.position.x,
				y: (typeof property.position.y == 'number') ?
					((property.position.y < 0 && !property.position.stuck) ?
						(WORLD.element.height + property.position.y) << 0 :
						property.position.y << 0) :
					this.property.position.y
			};

			__updateObjectOffset(this);

		}

		return this;

	},

	// Получение свойства объекта

	get: function(key) {

		return cloneObject(this.property[key]);

	},

	// Клонирование объекта

	clone: function() {

		return new _object(this.name).set(this.property);

	},

	// Проверка на нахождение объекта в пределах карты

	onMap: function() {

		return !(
			this.data.offset.right < 0 ||
			this.data.offset.left > WORLD.element.width ||
			this.data.offset.bottom < 0 ||
			this.data.offset.top > WORLD.element.height
		);

	},

	// Проверка на отображение объекта

	isRender: function() {

		return (
			this.onMap() &&
			this.property.size.width > 0 &&
			this.property.size.height > 0 &&
			this.property.toggle &&
			this.property.opacity > 0
		);

	},

	// Установка урона объекту

	giveDamage: function(forward, damage) {

		if(this.property.health > 0) {

			if(!damage) {
				damage = forward;
				forward = null;
			}

			this.property.health -= damage;

			if(this.property.health <= 0) {

				this.property.health = 0;

				EVENTS['onObjectDeath'].run(this, {
					object: forward
				});

			}

		}

		return this;

	},

	// Установка дополнительного значения объекта

	setData: function(key, value) {

		if(typeof value == 'undefined') {
			delete this.property.data[key];
		} else {
			this.property.data[key] = value;
		}

		return this;

	},

	// Получение дополнительного значения объекта

	getData: function(key) {

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

		var newPosition = {
			x: (this.property.position.x + this.property.velocity.x * Math.cos(angle * -CONST.RAD)) << 0,
			y: (this.property.position.y + this.property.velocity.y * Math.sin(angle * -CONST.RAD)) << 0,
			stuck: true
		};

		if(this.property.fasten) {

			var offset = __getObjectPositionOffset(this, newPosition);

			for(var i = 0; i < this.data.polygons.points.length; ++i) {

				if(
					offset.left + this.data.polygons.points[i][0] < 0 || 
					offset.left + this.data.polygons.points[i][0] > WORLD.element.width || 
					offset.top + this.data.polygons.points[i][1] < 0 || 
					offset.top + this.data.polygons.points[i][1] > WORLD.element.height
				) {
					return this;
				}

			}

		}

		if(this.property.toggle) {
			if(__isObjectCollision(this, newPosition)) {
				return this;
			}
			if(!there(this)) {
				return undefined;
			}
		}

		this.set({
			position: newPosition
		});

		EVENTS['onObjectMove'].run(this, {
			position: newPosition
		});

		return this;

	},

	// Передвижение объекта по координатам

	moveTo: function(x, y) {

		this.move(anglePoint(this.property.position.x, this.property.position.y, x, y));

		return this;

	},

	// Проверка вхождения объекта в указанные координаты

	isLocated: function(x, y) {

		return __isPointInPolygons(this, x, y);

	}

};

/*
**	Системные функции объекта
*/

function __isObjectCollision(object, position) {

	var collision = false;

	for(var i = 0; i < OBJECTS.length; ++i) {

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
					EVENTS['onObjectEnter'].run(object, {
						object: OBJECTS[i]
					});
				}

				if(there(object) && there(OBJECTS[i])) {
					EVENTS['onObjectCollision'].run(object, {
						object: OBJECTS[i]
					});
				}

			}

		} else {

			if(object.data.collision[OBJECTS[i].id]) {

				delete object.data.collision[OBJECTS[i].id];

				if(!OBJECTS[i].property.collision) {
					EVENTS['onObjectLeave'].run(object, {
						object: OBJECTS[i]
					});
				}

			}

		}

		if(!there(object)) {
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

					EVENTS['onObjectPolygon'].run(object, {
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

function __updateObjectOffset(object) {

	object.data.offset = {
		left: object.property.position.x - object.property.size.width / 2,
		right: object.property.position.x + object.property.size.width / 2,
		top: object.property.position.y - object.property.size.height / 2,
		bottom: object.property.position.y + object.property.size.height / 2
	};

}

function __updateObjectPolygons(object) {

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

	for(var i = 0; i < object.property.polygons.length; ++i) {

		temp = [
			(object.property.polygons[i][0] / scale[0]) - center[0],
			(object.property.polygons[i][1] / scale[1]) - center[1]
		];

		object.data.polygons.points[i] = [
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

		if(size == CONST.FULL_SIZE) {
			size = [ document.documentElement.clientWidth, document.documentElement.clientHeight ];
			WORLD.element.style.position = 'absolute';
			WORLD.element.setAttribute('data-fullsize', true);
		}

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

	for(var i = 0; i < OBJECTS.length; ++i) {

		if(OBJECTS[i].name == name || typeof name == 'undefined') {
			result.push(OBJECTS[i]);
		}

	}

	return result;

}

// Создание HUD

function createHud(name, property) {

	if(typeof name == 'object') {
		property = name;
		name = 'Undefined';
	}

	var hud = new _hud(name);

	if(property) {
		hud.set(property);
	}

	return hud;

}

// Выборка HUD

function selectHud(name) {

	var result = [];

	for(var i = 0; i < HUD.length; ++i) {

		if(HUD[i].name == name || typeof name == 'undefined') {
			result.push(HUD[i]);
		}

	}

	return result;

}

// Проверка на существование элемента

function there(element) {

	if(typeof element != 'object' || typeof element.type == undefined) {
		return false;
	}

	if(element.type == 'hud') {
		return (HUD.indexOf(element) != -1);
	} else if(element.type == 'object') {
		return (OBJECTS.indexOf(element) != -1);
	} else {
		return false;
	}

}

// Поиск элемента по id

function findFromId(id) {
	
	var findData = OBJECTS.concat(HUD);

	for(var i = 0; i < findData.length; ++i) {
		if(findData[i].id === id) {
			return findData[i];
		}
	}

	return undefined;

}

// Кэширование спрайтов

function cacheSprites(path, sprites) {

	if(!sprites) {
		sprites = path;
		path = 'data/sprites/';
	} else {
		path += '/';
	}

	for(var i = 0; i < sprites.length; ++i) {

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

	for(var i = 0; i < sounds.length; ++i) {

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

		WORLD.canvas.globalAlpha = 1;

		for(var i = 0; i < 2; ++i) {

			if(!WORLD.map.position[i]) {
				continue;
			}

			var size = [
				WORLD.element.width - WORLD.map.position[i][0],
				WORLD.element.height - WORLD.map.position[i][1]
			];

			if(size[0] <= 0 || size[1] <= 0) {
				continue;
			}

			var mapWidth = (size[0] > WORLD.element.width) ?
					WORLD.element.width :
					size[0],
				mapHeight = (size[i][1] > WORLD.element.height) ?
					WORLD.element.height :
					size[1];

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

	};

}

// Движение карты

function moveMap(angle, speed) {

	if(!WORLD.map) {
		__consoleOnce('notdrawmap', 'Движение карты недопустимо: Не вызвана функция drawMap', 'warn');
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
			__consoleOnce('invalidmapangle', 'Движение карты недопустимо: Некорректный угол движения', 'warn');
			return;
		}
	}

	var x = (speed * Math.cos(angle * -CONST.RAD)) << 0,
		y = (speed * Math.sin(angle * -CONST.RAD)) << 0;

	for(var i = 0; i < 2; ++i) {
		WORLD.map.position[i][0] += x;
		WORLD.map.position[i][1] += y;
	}

	for(var i = 0; i < 2; ++i) {

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

	for(var i = 0; i < OBJECTS.length; ++i) {

		if(!OBJECTS[i].property.toggle) {
			continue;
		}

		EVENTS['onObjectUpdate'].run(OBJECTS[i], {
			object: OBJECTS[i]
		});

	}

	for(var i = 0; i < OBJECTS.length; ++i) {

		if(!OBJECTS[i].isRender()) {
			continue;
		}

		WORLD.canvas.globalAlpha = OBJECTS[i].property.opacity;
		WORLD.canvas.translate(OBJECTS[i].property.position.x, OBJECTS[i].property.position.y);
		WORLD.canvas.rotate(OBJECTS[i].data.angle);

		if(OBJECTS[i].property.background) {
			WORLD.canvas.fillStyle = OBJECTS[i].property.background;
			WORLD.canvas.fillRect(
				-OBJECTS[i].property.size.width / 2, 
				-OBJECTS[i].property.size.height / 2, 
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height
			);
		}

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
			__renderPolygons(OBJECTS[i]);
		}

	}

	WORLD.canvas.stroke();

	for(var i = 0; i < HUD.length; ++i) {

		if(!HUD[i].property.toggle) {
			continue;
		}

		EVENTS['onHudUpdate'].run(HUD[i], {
			hud: HUD[i]
		});

	}

	for(var i = 0; i < HUD.length; ++i) {

		if(!HUD[i].isRender()) {
			continue;
		}

		WORLD.canvas.globalAlpha = HUD[i].property.opacity;
		WORLD.canvas.translate(HUD[i].data.center.x, HUD[i].data.center.y);
		WORLD.canvas.rotate(HUD[i].data.angle);

		if(HUD[i].property.background) {
			WORLD.canvas.fillStyle = HUD[i].property.background;
			WORLD.canvas.fillRect(
				-HUD[i].data.size.width / 2, 
				-HUD[i].data.size.height / 2, 
				HUD[i].data.size.width, 
				HUD[i].data.size.height
			);
		}

		if(HUD[i].data.sprite) {
			WORLD.canvas.drawImage(
				HUD[i].data.sprite,
				-HUD[i].data.size.width / 2, 
				-HUD[i].data.size.height / 2, 
				HUD[i].data.size.width, 
				HUD[i].data.size.height
			);
		}

		WORLD.canvas.textAlign = HUD[i].property.align;
		WORLD.canvas.font = HUD[i].property.textStyle + ' ' + HUD[i].property.textSize + 'px ' + HUD[i].property.textFont;
		WORLD.canvas.fillStyle = HUD[i].property.textColor;
		WORLD.canvas.fillText(
			HUD[i].property.text, 
			HUD[i].data.offsetText.x, 
			HUD[i].data.offsetText.y
		);

		WORLD.canvas.rotate(-HUD[i].data.angle);
		WORLD.canvas.translate(-HUD[i].data.center.x, -HUD[i].data.center.y);

		if(HUD[i].data.polygons.points.length > 2 && CONST.DEBUG) {
			__renderPolygons(HUD[i]);
		}

	}

	for(var i = 0; i < keyHas.length; ++i) {
		EVENTS['onKeyHas'].run(keyHas[i]);
	}

	EVENTS['onWorldUpdate'].run();

}

/*
**	Массив событий
*/

var EVENTLIST = [

	'onObjectUpdate',			// Обновление объекта
	'onObjectMove', 			// Движение объекта
	'onObjectCollision', 		// Столкновения объекта с другим объектом
	'onObjectEnter',  			// Вход объекта в другой объект
	'onObjectPolygon', 			// Обновление столкнувшегося полигона
	'onObjectLeave', 			// Выход объекта из другого объекта
	'onObjectDeath',			// Смерть объекта

	'onHudUpdate', 				// Обновление HUD

	'onWorldUpdate', 			// Обновление мира

	'onKeyHas', 				// Удержание клавиши
	'onKeyDown', 				// Нажатие клавиши
	'onKeyUp', 					// Отжатие клавиши

	'onMouseMove', 				// Движение мышки
	'onMouseDown', 				// Нажатие мышки
	'onMouseUp', 				// Отжатие мышки
	'onMouseClicked', 			// Клик мышки

	'onMouseEnterObject', 		// Вход мышки в объект
	'onMouseLeaveObject', 		// Выход мышки из объекта
	'onClickedObject', 			// Клик мышки по объекту

	'onMouseEnterHud', 			// Вход мышки в HUD
	'onMouseLeaveHud', 			// Выход мышки из HUD
	'onClickedHud' 				// Клик мышки по HUD

];

var EVENTS = [];

/*
**	Класс события
*/

function _event(key) {

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

		for(var i = 0; i < this.save.target.length; ++i) {

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

		if(!params) {

			for(var i = 0; i < this.callback.length; ++i) {
				this.callback[i](target);
			}

		} else {

			for(var i = 0; i < this.callback.length; ++i) {
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

for(var i = 0; i < EVENTLIST.length; ++i) {
	new _event(EVENTLIST[i]);
}

/*
**	Массив HUD
*/

var HUD = [];

/*
**	Класс HUD
*/

function _hud(name, text) {

	this.type = 'hud';
	this.name = name;
	this.id = ++lastId;

	this.data = {
		mouse: false,
		center: {
			x: 0,
			y: 0
		},
		size: {
			width: 0,
			height: 0
		},
		sprite: null,
		angle: 0,
		offsetText: {
			x: 0,
			y: 0
		},
		offset: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		polygons: {
			points: [],
			local: []
		}
	};

	this.property = {
		text: '',
		textColor: '#fff',
		textSize: 14,
		textFont: 'Arial',
		textStyle: '',
		textPadding: [ 0, 0, 0, 0 ],
		sprite: null,
		toggle: true,
		align: 'left',
		background: null,
		angle: 0,
		position: {
			x: 0,
			y: 0
		},
		opacity: 1,
		size: {
			width: 'auto',
			height: 'auto'
		},
		index: 1
	}

	HUD.push(this);
	__sortByIndex(HUD);

}

/*
**	Функции HUD
*/

_hud.prototype = {

	// Удаление HUD

	destroy: function() {

		HUD.splice(HUD.indexOf(this), 1);

		clearObject(this);

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

		// Установка непрозрачности

		if(typeof property.opacity == 'number') {

			this.property.opacity = property.opacity;
			
		}

		// Установка индекса поверхности

		if(typeof property.index == 'number') {

			this.property.index = property.index;

			__sortByIndex(HUD);

		}

		// Установка фона

		if(typeof property.background == 'string') {

			this.property.background = property.background;
			
		} else if(property.background === null) {

			this.property.background = null;

		}

		// Установка изображения

		if(typeof property.sprite == 'string') {

			if(!WORLD.sprites[property.sprite]) {
				console.warn('Спрайт ' + property.sprite + ' не найден в кэше игры');
			} else {

				this.property.sprite = property.sprite;
				this.data.sprite = WORLD.sprites[property.sprite];

			}

		} else if(property.sprite === null) {

			this.property.sprite = null;
			this.data.sprite = null;

		}

		// Установка отступа текста

		if(typeof property.textPadding == 'object') {

			if(property.textPadding.length != 4) {
				console.warn('Неверный формат отступов текста');
			} else {

				this.property.textPadding = property.textPadding;

			}
			
		}

		// Установка угла поворота

		if(typeof property.angle == 'number') {

			if(property.angle > 360) {
				property.angle -= 360;
			} else if(property.angle < -360) {
				property.angle += 360;
			}

			this.data.angle = (this.property.angle = property.angle) * -CONST.RAD;

		}

		// Установка позиционирования

		if(typeof property.align == 'string') {

			if(property.align != 'left' && property.align != 'center' && property.align != 'right') {
				console.warn('Неверный тип позиционирования HUD');
			} else {

				this.property.align = property.align;

			}	
			
		}

		// Установка координат

		if(typeof property.position == 'object') {

			this.property.position = {
				x: (typeof property.position.x == 'number') ?
					((property.position.x < 0) ?
						(WORLD.element.width + property.position.x) << 0 :
						property.position.x << 0) :
					this.property.position.x,
				y: (typeof property.position.y == 'number') ?
					((property.position.y < 0) ?
						(WORLD.element.height + property.position.y) << 0 :
						property.position.y << 0) :
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

		__updateHudData(this, this.property.size);

		return this;

	},

	// Проверка на нахождение HUD в пределах карты

	onMap: function() {

		return !(
			this.data.offset.right < 0 ||
			this.data.offset.left > WORLD.element.width ||
			this.data.offset.bottom < 0 ||
			this.data.offset.top > WORLD.element.height
		);

	},

	// Проверка на отображение HUD

	isRender: function() {

		return (
			this.onMap() &&
			this.data.size.width > 0 &&
			this.data.size.height > 0 &&
			this.property.toggle &&
			this.property.opacity > 0
		);

	},

	// Получение свойства HUD

	get: function(key) {

		return cloneObject(this.property[key]);

	},

	// Клонирование HUD

	clone: function() {

		return new _hud(this.name).set(this.property);

	},

	// Проверка вхождения HUD в указанные координаты

	isLocated: function(x, y) {

		return __isPointInPolygons(this, x, y);

	}

};

/*
**	Системные функции HUD
*/

function __updateHudData(hud, size) {

	if(typeof size.width == 'number') {
		hud.data.size.width = cloneObject(size.width) + hud.property.textPadding[3] + hud.property.textPadding[1];
	} else if(size.width == 'auto') {
		WORLD.canvas.font = hud.property.textStyle + ' ' + hud.property.textSize + 'px ' + hud.property.textFont;
		hud.data.size.width = WORLD.canvas.measureText(hud.property.text).width + hud.property.textPadding[3] + hud.property.textPadding[1];
	}

	if(typeof size.height == 'number') {
		hud.data.size.height = cloneObject(size.height) + hud.property.textPadding[0] + hud.property.textPadding[2];
	} else if(size.height == 'auto') {
		hud.data.size.height = hud.property.textSize * CONST.FONTHEIGHT + hud.property.textPadding[0] + hud.property.textPadding[2];
	}

	var offsetLeft = 0,
		offsetTextLeft = 0,
		centerX = 0;

	switch(hud.property.align) {

		case 'left':
			offsetLeft = hud.property.position.x;
			offsetTextLeft = hud.property.textPadding[3] - hud.data.size.width / 2;
			centerX = hud.property.position.x + hud.data.size.width / 2;
		break;

		case 'center':
			offsetLeft = hud.property.position.x - hud.data.size.width / 2;
			centerX = hud.property.position.x;
		break;

		case 'right':
			offsetLeft = hud.property.position.x - hud.data.size.width;
			offsetTextLeft = -hud.property.textPadding[3] + hud.data.size.width / 2;
			centerX = hud.property.position.x - hud.data.size.width / 2;
		break;

	}

	hud.data.offset = {
		left: offsetLeft,
		right: offsetLeft + hud.data.size.width,
		top: hud.property.position.y,
		bottom: hud.property.position.y + hud.data.size.height
	};

	hud.data.center = {
		x: centerX,
		y: hud.property.position.y + hud.data.size.height / 2
	};

	hud.data.offsetText = {
		x: offsetTextLeft,
		y: hud.property.textPadding[0] - hud.data.size.height / 2
	};

	hud.data.polygons.local = [
		[ 0, 0 ],
		[ hud.data.size.width, 0 ],
		[ hud.data.size.width, hud.data.size.height ],
		[ 0, hud.data.size.height ]
	];

	__updateHudPolygons(hud);

}

function __updateHudPolygons(hud) {

	var sin = Math.sin(hud.data.angle),
		cos = Math.cos(hud.data.angle);

	var center = [
		hud.data.size.width / 2,
		hud.data.size.height / 2
	];

	var temp = [];

	for(var i = 0; i < hud.data.polygons.local.length; ++i) {

		temp = [
			hud.data.polygons.local[i][0] - center[0],
			hud.data.polygons.local[i][1] - center[1]
		];

		hud.data.polygons.points[i] = [
			(center[0] + (temp[0] * cos - temp[1] * sin)) << 0,
			(center[1] + (temp[0] * sin + temp[1] * cos)) << 0
		];

	}

	hud.data.polygons.points[hud.data.polygons.local.length] = hud.data.polygons.points[0];

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

	function ClearKeyHas() {
		keyHas = [];
	}

	window.addEventListener('blur', ClearKeyHas);
	window.addEventListener('contextmenu', ClearKeyHas);

	document.addEventListener('keydown', function(event) {

		if(keyHas.indexOf(event.keyCode) != -1) {
			return;
		}

		keyHas[keyHas.length] = event.keyCode;

		EVENTS['onKeyDown'].run(event.keyCode);

	});

	document.addEventListener('keyup', function(event) {

		if(keyHas.indexOf(event.keyCode) == -1) {
			return;
		}

		keyHas.splice(keyHas.indexOf(event.keyCode), 1);

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

		for(var i = 0; i < OBJECTS.length; ++i) {

			if(OBJECTS[i].isLocated(event.pageX, event.pageY) && OBJECTS[i].property.toggle) {

				if(!OBJECTS[i].data.mouse) {

					OBJECTS[i].data.mouse = true;

					EVENTS['onMouseEnterObject'].run(OBJECTS[i], {
						position: currentPosition
					});

				}

			} else if(OBJECTS[i].data.mouse) {

				OBJECTS[i].data.mouse = false;

				EVENTS['onMouseLeaveObject'].run(OBJECTS[i], {
					position: currentPosition
				});

			}

		}

		for(var i = 0; i < HUD.length; ++i) {

			if(HUD[i].isLocated(event.pageX, event.pageY) && HUD[i].property.toggle) {

				if(!HUD[i].data.mouse) {

					HUD[i].data.mouse = true;

					EVENTS['onMouseEnterHud'].run(HUD[i], {
						position: currentPosition
					});

				}

			} else if(HUD[i].data.mouse) {

				HUD[i].data.mouse = false;

				EVENTS['onMouseLeaveHud'].run(HUD[i], {
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

		for(var i = 0; i < OBJECTS.length; ++i) {
			if(OBJECTS[i].isLocated(event.pageX, event.pageY) && OBJECTS[i].property.toggle) {
				EVENTS['onClickedObject'].run(OBJECTS[i], {
					position: currentPosition
				});
			}
		}

		for(var i = 0; i < HUD.length; ++i) {
			if(HUD[i].isLocated(event.pageX, event.pageY) && HUD[i].property.toggle) {
				EVENTS['onClickedHud'].run(HUD[i], {
					position: currentPosition
				});
			}
		}

	});

	WORLD.element.addEventListener('mousedown', function(event) {

		EVENTS['onMouseDown'].run({
			position: {
				x: event.pageX - WORLD.element.offsetLeft,
				y: event.pageY - WORLD.element.offsetTop
			}
		});

	});

	WORLD.element.addEventListener('mouseup', function(event) {

		EVENTS['onMouseUp'].run({
			position: {
				x: event.pageX - WORLD.element.offsetLeft,
				y: event.pageY - WORLD.element.offsetTop
			}
		});

	});

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

function __renderPolygons(element) {

	for(var i = 0; i < element.data.polygons.points.length - 1; ++i) {
		WORLD.canvas.moveTo(
			element.data.offset.left + element.data.polygons.points[i][0], 
			element.data.offset.top + element.data.polygons.points[i][1]
		);
		WORLD.canvas.lineTo(
			element.data.offset.left + element.data.polygons.points[i + 1][0], 
			element.data.offset.top + element.data.polygons.points[i + 1][1]
		);
	}

}

function __isPointInPolygons(element, x, y) {

	var inside = false,
		dx = [],
		dy = [];

	for(var i = 0, j = element.data.polygons.points.length - 1; i < element.data.polygons.points.length; j = i++) {

		dx = [
			element.data.offset.left + element.data.polygons.points[i][0],
			element.data.offset.left + element.data.polygons.points[j][0]
		];
		dy = [
			element.data.offset.top + element.data.polygons.points[i][1],
			element.data.offset.top + element.data.polygons.points[j][1]
		];

		if(((dy[0] > y) != (dy[1] > y)) && (x < (dx[1] - dx[0]) * (y - dy[0]) / (dy[1] - dy[0]) + dx[0])) {
			inside = !inside;
		} 

	}

	return inside;

}

function __consoleOnce(key, text, method) {

	if(onceLog[key]) {
		return;
	}

	switch(method) {
		case 'warn':
			console.warn(text);
		break;
		case 'info':
			console.info(text);
		break;
		case 'error':
			console.error(text);
		break;
		default:
			console.log(text);
		break;
	}

	onceLog[key] = true;

}

function __sortByIndex(array) {

	var cache;

	for(var i = 0; i < array.length; ++i) {
		for(var k = 0; k < array.length - i; ++k) {
			if(array[i].property.index < array[k].property.index) {
				cache = array[i];
				array[i] = array[k];
				array[k] = cache;
			}
		}
	}

}

function clearObject(object) {

	if(typeof object != 'object') {
		return false;
	}

	for(var i in object) {
		delete object[i];
	}

	for(var i in object.__proto__) {
		object[i] = function() {
			return object;
		};
	}

}

function cloneObject(object) {

	if(typeof object != 'object') {
		return object;
	}

	var temp = new object.constructor(); 

	for(var k in object) {
		temp[k] = (typeof object[k] == 'object') ?
			cloneObject(object[k]) :
			object[k];
	}

	return temp;

}

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
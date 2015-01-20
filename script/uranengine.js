/*

	uranEngine 
	Current version: v1.4.0
	www.uranengine.ru 

*/

/*
**	Константы
*/

var CONST = {

	RAD: Math.PI / 180,
	DEG: 180 / Math.PI,
	FRAMES: 60,
	DEBUG: true

};

/*
**	Массив объектов
*/

var OBJECTS = [];

/*
**	Класс объекта
*/

function _element(name) {

	this.name = name;
	this.id = new Date().getTime();

	this.data = {
		polygons: {
			save: [],
			full: []
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
		angle: 0
		// ...
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

_element.prototype = {

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
			return;
		}

		// Установка размеров объекта

		if(typeof property.size == 'object') {

			var prevSize = this.property.size;

			this.property.size = {
				width: (typeof property.size.width == 'number') ? property.size.width : this.property.size.width,
				height: (typeof property.size.height == 'number') ? property.size.height : this.property.size.height
			};

			if(!this.data.polygons.save.length) {

				this.set({
					polygons: [
						[ 0, 0 ],
						[ this.property.size.width, 0 ],
						[ this.property.size.width, this.property.size.height ],
						[ 0, this.property.size.height ]
					]
				});

			} else if(this.property.size.width != prevSize.width || this.property.size.height != prevSize.height) {

				for(var k in this.data.polygons.save) {

					this.data.polygons.full[k] = this.data.polygons.save[k] = [
						this.data.polygons.save[k][0] / prevSize.width * this.property.size.width,
						this.data.polygons.save[k][1] / prevSize.height * this.property.size.height
					];

				}

				this.data.polygons.full[this.property.polygons.length] = this.data.polygons.full[0];

			}

			__updateOffset(this);

		}

		// Установка полигонов объекта

		if(typeof property.polygons == 'object') {

			if(property.polygons.length < 3) {
				console.warn('Количество полигонов не может быть меньше трех');
			} else {

				if(this.property.size.width == 0 && this.property.size.height == 0) {

					for(var k in property.polygons) {
						this.property.size = {
							width: (this.property.size.width < property.polygons[k][0]) ? property.polygons[k][0] : this.property.size.width,
							height: (this.property.size.height < property.polygons[k][1]) ? property.polygons[k][1] : this.property.size.height
						};
					}

					__updateOffset(this);

				}

				this.property.polygons = property.polygons;

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

			this.property.angle = property.angle;
			this.data.angle = property.angle * -CONST.RAD;

			__updatePolygons(this);

		}

		// Установка спрайта объекта

		if(typeof property.sprite == 'string') {

			if(!WORLD.sprites[property.sprite]) {
				console.warn('Спрайт ' + property.sprite + ' не найден в кэше игры');
			} else {
				this.property.sprite = WORLD.sprites[property.sprite];
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
					EVENTS['death'].call(this, {
						object: this
					});
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

			var newPosition = {
				_x: (typeof property.position.x == 'number') ? property.position.x : this.property.position.x,
				_y: (typeof property.position.y == 'number') ? property.position.y : this.property.position.y
			};

			var offset = __getObjectPositionOffset(this, {
				x: newPosition._x,
				y: newPosition._y
			});

			if(this.property.fasten) {

				for(var k in this.data.polygons.save) {

					if(
						offset.left + this.data.polygons.save[k][0] < 0 || 
						offset.left + this.data.polygons.save[k][0] > WORLD.element.width || 
						offset.top + this.data.polygons.save[k][1] < 0 || 
						offset.top + this.data.polygons.save[k][1] > WORLD.element.height
					) {
						return this;
					}

				}

			}

			if(__isObjectCollision(this, {
				x: newPosition._x,
				y: newPosition._y
			})) {
				return this;
			}

			if(!this.has()) {
				return;
			}

			this.property.position = {
				x: newPosition._x,
				y: newPosition._y
			};

			__updateOffset(this);

		}

		return this;

	},

	// Получение свойства объекта

	get: function(key) {

		return this.property[key];

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
			return;
		}

		if(this.property.health <= 0) {
			return this;
		}

		if(!damage) {
			damage = forward;
			forward = null;
		}

		this.property.health -= damage;

		if(this.property.health <= 0) {

			this.property.health = 0;

			EVENTS['death'].call(this, {
				object: this,
				actor: forward
			});

		}

		return this;

	},

	// Обозначение объекта как игрока

	specifyPlayer: function() {

		if(!this.has()) {
			return;
		}

		WORLD.player = this;

		return this;

	},

	// Установка дополнительного значения объекта

	setData: function(key, value) {

		if(!this.has()) {
			return;
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
			return;
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
			return;
		}

		var newPosition = {
			x: this.property.position.x + this.property.velocity.x * Math.cos(angle * -CONST.RAD),
			y: this.property.position.y + this.property.velocity.y * Math.sin(angle * -CONST.RAD)
		};

		this.set({
			position: newPosition
		});

		EVENTS['move'].call(this, {
			object: this,
			position: newPosition
		});

		return this;

	},

	// Передвижение объекта по координатам

	moveTo: function(x, y) {

		if(!this.has()) {
			return;
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

		if(__isPositionInObject(position, OBJECTS[i], object)) {
			
			if(OBJECTS[i].property.collision) {
				collision = true;
			}

			if(!object.data.collision[OBJECTS[i].id]) {

				object.data.collision[OBJECTS[i].id] = true;

				if(!OBJECTS[i].property.collision) {
					EVENTS['enter'].call(object, {
						object: object,
						actor: OBJECTS[i]
					});
				}

				if(object.has() && OBJECTS[i].has()) {
					EVENTS['collision'].call(object, {
						object: object,
						actor: OBJECTS[i]
					});
				}

			}

		} else {

			if(object.data.collision[OBJECTS[i].id]) {

				delete object.data.collision[OBJECTS[i].id];

				if(!OBJECTS[i].property.collision) {
					EVENTS['leave'].call(object, {
						object: object,
						actor: OBJECTS[i]
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

function __isPositionInObject(position, getObject, object) {

	var offset = __getObjectPositionOffset(object, position);

	if(offset.left > getObject.data.offset.right || offset.right < getObject.data.offset.left ||
	   offset.top > getObject.data.offset.bottom || offset.bottom < getObject.data.offset.top) {
		return false;
	}

	for(var k = 0; k < object.data.polygons.full.length - 1; ++k) {

		if(__isPositionInPolygon(offset.left + object.data.polygons.full[k][0], offset.top + object.data.polygons.full[k][1], getObject)) {
			return true;
		}

		if(__isLineIntersectObject([
			offset.left + object.data.polygons.full[k][0], 
			offset.top + object.data.polygons.full[k][1]
		], [
			offset.left + object.data.polygons.full[k + 1][0], 
			offset.top + object.data.polygons.full[k + 1][1]
		], getObject)) {
			return true;
		}

	}

	function __isLineIntersectObject(A_start, A_end, _object) {

		for(var k = 0; k < _object.data.polygons.full.length - 1; ++k) {

			var B_start = [
					_object.data.offset.left + _object.data.polygons.full[k][0], 
					_object.data.offset.top + _object.data.polygons.full[k][1]
				],
				B_end = [
					_object.data.offset.left + _object.data.polygons.full[k + 1][0], 
					_object.data.offset.top + _object.data.polygons.full[k + 1][1]
				];

			if(

				((B_start[1] - B_end[1]) * A_start[0] +
				(B_end[0] - B_start[0]) * A_start[1] +
				(B_start[0] * B_end[1] - B_end[0] * B_start[1]) == 0 ||
				(B_start[1] - B_end[1]) * A_end[0] +
				(B_end[0] - B_start[0]) * A_end[1] +
				(B_start[0] * B_end[1] - B_end[0] * B_start[1]) == 0) ||

				((((B_end[0] - B_start[0]) * (A_start[1] - B_start[1]) - (B_end[1] - B_start[1]) * (A_start[0] - B_start[0])) *
				((B_end[0] - B_start[0]) * (A_end[1] - B_start[1]) - (B_end[1] - B_start[1]) * (A_end[0] - B_start[0]))) < 0 && 
				(((A_end[0] - A_start[0]) * (B_start[1] - A_start[1]) - (A_end[1] - A_start[1]) * (B_start[0] - A_start[0])) *
				((A_end[0] - A_start[0]) * (B_end[1] - A_start[1]) - (A_end[1] - A_start[1]) * (B_end[0] - A_start[0]))) < 0)

			) {
				return true;
			}

		}

		return false;	
		
	}

	return false;

}

function __isPositionInPolygon(_x, _y, _object) {

	var inside = false,
		x = [],
		y = [];

	for(var i = 0, j = _object.data.polygons.save.length - 1; i < _object.data.polygons.save.length; j = i++) {

		x = [
			_object.data.offset.left + _object.data.polygons.save[i][0],
			_object.data.offset.left + _object.data.polygons.save[j][0]
		];
		y = [
			_object.data.offset.top + _object.data.polygons.save[i][1],
			_object.data.offset.top + _object.data.polygons.save[j][1]
		];

		if(((y[0] > _y) != (y[1] > _y)) && (_x < (x[1] - x[0]) * (_y - y[0]) / (y[1] - y[0]) + x[0])) {
			inside = !inside;
		} 

	}

	return inside;

}

function __getObjectPositionOffset(object, position) {

	return {
		left: position.x - object.property.size.width / 2,
		right: position.x + object.property.size.width / 2,
		top: position.y - object.property.size.height / 2,
		bottom: position.y + object.property.size.height / 2
	}

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

	var sin = Math.sin(object.data.angle),
		cos = Math.cos(object.data.angle);

	for(var k in object.property.polygons) {

		var xTemp = object.property.polygons[k][0] - object.property.size.width / 2,
			yTemp = object.property.polygons[k][1] - object.property.size.height / 2;

		object.data.polygons.full[k] = object.data.polygons.save[k] = [
			(object.property.size.width / 2) + (xTemp * cos - yTemp * sin),
			(object.property.size.height / 2) + (xTemp * sin + yTemp * cos)
		];

	}

	object.data.polygons.full[object.property.polygons.length] = object.data.polygons.full[0];

}

/*
**	События объекта
*/

// Событие смерти объекта

function onDeath(target, callback) {

	EVENTS['death'].addCallback(target, callback);

}

// Событие столкновения объектов

function onCollision(target, callback) {

	EVENTS['collision'].addCallback(target, callback);

}

// Событие движения объекта

function onMove(target, callback) {

	EVENTS['move'].addCallback(target, callback);

}

// Событие входа объекта в объект

function onEnter(target, callback) {

	EVENTS['enter'].addCallback(target, callback);

}

// Событие выхода объекта их объекта

function onLeave(target, callback) {

	EVENTS['leave'].addCallback(target, callback);

}

// Событие обновления объекта

function onUpdate(target, callback) {

	EVENTS['update'].addCallback(target, callback);

}

// Событие клика по объекту

function onClicked(target, callback) {

	EVENTS['clicked'].addCallback(target, callback);

}

/*
**	Свойства мира
*/

var WORLD = {

	canvas: null,
	element: null,
	sounds: [],
	sprites: [],
	map: null,
	player: null,
	callback: {
		update: null,
		map: null
	}

};

/*
**	Функции мира
*/

// Создание мира

function createWorld(canvasID, size, callback) {

	window.onload = function() {

		WORLD.element = document.getElementById(canvasID);

		if(!WORLD.element) {
			return console.error('Canvas с id `' + canvasID + '` не найден');
		}

		WORLD.canvas = WORLD.element.getContext('2d');

		WORLD.element.width = size[0];
		WORLD.element.height = size[1];

		WORLD.canvas.textBaseline = 'middle';
		WORLD.canvas.lineWidth = 2;
		WORLD.canvas.strokeStyle = '#ff0000';

		(function loop(){
			requestAnimFrame(loop);
			__updateWorld();
		})();

		callback();

	}

}

// Создание объекта

function createObject(name, property) {

	if(typeof name == 'object') {
		property = name;
		name = 'Undefined';
	}

	var object = new _element(name);

	if(property) {
		object.set(property);
	}

	return object;

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
		}

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
		}

	}

}

// Воспроизведение звука

function playSound(file) {

	if(!WORLD.sounds[file]) {
		return console.warn('Звук ' + file + ' не найден в кэше игры');
	}

	WORLD.sounds[file].load();
	WORLD.sounds[file].play();

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

			if(WORLD.map.position[i]) {
				WORLD.canvas.drawImage(
					WORLD.map.sprite, 0, 0,
					WORLD.element.width - WORLD.map.position[i][0], 
					WORLD.element.height - WORLD.map.position[i][1],
					WORLD.map.position[i][0], 
					WORLD.map.position[i][1],
					WORLD.element.width - WORLD.map.position[i][0], 
					WORLD.element.height - WORLD.map.position[i][1]
				);
			}

		}

	}

}

// Движение карты

function moveMap(angle, speed) {

	if(!WORLD.map) {
		return;
	}

	if(!WORLD.map.position[1]) {
		if(angle == 180) {
			WORLD.map.position[1] = [ WORLD.element.width, 0 ];
		} else if(angle == 0) {
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

	var sin = Math.sin(angle * -CONST.RAD),
		cos = Math.cos(angle * -CONST.RAD);

	for(var i = 0; i < 2; ++i) {
		WORLD.map.position[i][0] += speed * cos;
		WORLD.map.position[i][1] += speed * sin;
	}

	for(var i = 0; i < 2; ++i) {
		if(WORLD.map.position[i][0] + WORLD.element.width <= 0) {
			WORLD.map.position[i][0] = WORLD.element.width;
		}
		if(WORLD.map.position[i][0] >= WORLD.element.width) {
			WORLD.map.position[i][0] = -WORLD.element.width;
		}
		if(WORLD.map.position[i][1] + WORLD.element.height <= 0) {
			WORLD.map.position[i][1] = WORLD.element.height;
		}
		if(WORLD.map.position[i][1] >= WORLD.element.height) {
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

	for(var i in OBJECTS) {

		EVENTS['update'].call(OBJECTS[i], {
			object: OBJECTS[i]
		});

	}

	for(var i in OBJECTS) {

		if(!OBJECTS[i].isVisible() || OBJECTS[i].property.size.width == 0 || OBJECTS[i].property.size.height == 0) {
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

		} else if(OBJECTS[i].property.sprite) {

			WORLD.canvas.drawImage(
				OBJECTS[i].property.sprite, 
				-OBJECTS[i].property.size.width / 2, 
				-OBJECTS[i].property.size.height / 2,
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height
			);

		}

		WORLD.canvas.rotate(-OBJECTS[i].data.angle);
		WORLD.canvas.translate(-OBJECTS[i].property.position.x, -OBJECTS[i].property.position.y);

		if(OBJECTS[i].data.polygons.full.length > 2 && CONST.DEBUG) {

			for(var k = 0; k < OBJECTS[i].data.polygons.full.length - 1; ++k) {
				WORLD.canvas.moveTo(
					OBJECTS[i].data.offset.left + OBJECTS[i].data.polygons.full[k][0], 
					OBJECTS[i].data.offset.top + OBJECTS[i].data.polygons.full[k][1]
				);
				WORLD.canvas.lineTo(
					OBJECTS[i].data.offset.left + OBJECTS[i].data.polygons.full[k + 1][0], 
					OBJECTS[i].data.offset.top + OBJECTS[i].data.polygons.full[k + 1][1]
				);
			}

		}

	}

	WORLD.canvas.stroke();

	for(var i in HUD) {

		if(!HUD[i].text.length || !HUD[i].property.toggle) {
			continue;
		}

		WORLD.canvas.textAlign = HUD[i].property.align;
		WORLD.canvas.fillStyle = HUD[i].property.color;
		WORLD.canvas.font = (HUD[i].property.bold ? 'bold ' : '') + HUD[i].property.size + 'px ' + HUD[i].property.font;
		WORLD.canvas.fillText(HUD[i].text, HUD[i].property.position.x, HUD[i].property.position.y);

	}

	if(keyController.callback.has) {
		for(var i in keyController.has) {
			if(keyController.has[i]) {
				keyController.callback.has(i);
			}
		}
	}

	if(WORLD.callback.update) {
		WORLD.callback.update();
	}

}

/*
**	События мира
*/

// Обновление мира

function onWorldUpdate(callback) {

	WORLD.callback.update = callback;

}

/*
**	Массив событий
*/

var EVENTS = [];

/*
**	Класс события
*/

function _event(key) {

	if(EVENTS[key]) {
		return;
	}

	this.name = name;

	this.callback = [];
	this.target = [];

	this.save = {
		params: [],
		target: []
	};

	EVENTS[key] = this;

}

/*
**	Функции события
*/

_event.prototype = {

	// Добавления обработчика события

	addCallback: function(target, callback) {

		var newCallback = this.callback.length;

		if(!callback) {
			this.callback[newCallback] = target;
		} else {
			this.target[newCallback] = target;
			this.callback[newCallback] = callback;
		}

		for(var i in this.save.target) {

			this.call(this.save.target[i], this.save.params[i]);

			delete this.save.target[i];
			delete this.save.params[i];

		}

	},

	// Вызов события

	call: function(target, params) {

		if(!this.callback.length) {

			var newPrev = this.save.target.length;

			this.save.target[newPrev] = target;
			this.save.params[newPrev] = params;

			return;

		}

		for(var i in this.callback) {

			if(this.target[i] === target || this.target[i] === target.name || !this.target[i]) {
				this.callback[i](params);
			}

		}

	}

};

/*
**	Добавление событий
*/

var EVENT_LIST = [
	'move', 
	'collision', 
	'death', 
	'enter', 
	'leave', 
	'update', 
	'clicked'
];

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

	this.property = {
		toggle: false,
		align: 'left',
		color: '#fff',
		size: 14,
		font: 'Arial',
		bold: false,
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

	// Обновление текста

	setText: function(text) {

		this.text = text || '';

		return this;

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

		// Установка толстого шрифта

		if(typeof property.bold == 'boolean') {

			this.property.bold = property.bold;
			
		}

		// Установка позиционирования

		if(typeof property.align == 'string') {

			this.property.align = property.align;
			
		}

		// Установка позиции

		if(typeof property.position == 'object') {

			this.property.position = {
				x: (typeof property.position.x == 'number') ? property.position.x : this.property.position.x,
				y: (typeof property.position.y == 'number') ? property.position.y : this.property.position.y
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

		return this.property[key];

	},

	// Удаление HUD

	destroy: function() {

		HUD.splice(HUD.indexOf(this), 1);

		delete this.text;
		delete this.property;

	}

};

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

	has: [],
	callback: {
		has: null,
		down: null,
		up: null,
		click: null,
		move: null
	}

};

/*
**	Контроллер клавиш
*/

window.onmousemove = function(event) {

	if(keyController.callback.move) {
		keyController.callback.move({
			x: event.pageX,
			y: event.pageY
		});
	}

}

window.onkeydown = function(event) {

	if(!__isGameKey(event.keyCode) || keyController.has[event.keyCode]) {
		return;
	}

	keyController.has[event.keyCode] = true;

	if(keyController.callback.down) {
		keyController.callback.down(event.keyCode);
	}

}

window.onkeyup = function(event) {

	if(!__isGameKey(event.keyCode) || !keyController.has[event.keyCode]) {
		return;
	}

	keyController.has[event.keyCode] = false;

	if(keyController.callback.up) {
		keyController.callback.up(event.keyCode);
	}

}

window.onclick = function(event) {

	if(keyController.callback.click) {
		keyController.callback.click({
			position: {
				x: event.pageX,
				y: event.pageY
			}
		});
	}

	for(var i in OBJECTS) {

		if(__isPositionInPolygon(event.pageX, event.pageY, OBJECTS[i])) {

			EVENTS['clicked'].call(OBJECTS[i], {
				object: OBJECTS[i],
				position: {
					x: event.pageX,
					y: event.pageY
				}
			});

		}

	}

}

/*
**	События контроллера клавиш
*/

// Событие удержки игровой клавиши 

function onKeyHas(callback) {

	keyController.callback.has = callback;

}

// Событие нажатия игровой клавиши 

function onKeyDown(callback) {

	keyController.callback.down = callback;

}

// Событие отжатия игровой клавиши 

function onKeyUp(callback) {

	keyController.callback.up = callback;

}

// Событие клика по миру

function onClicked(callback) {

	keyController.callback.click = callback;

}

// Событие движения мышки

function onMouseMove(callback) {

	keyController.callback.move = callback;

}

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

window.requestAnimFrame = (function() {

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
**	Прочие системные функции
*/

function random(min, max) {

	return Math.round(min - 0.5 + Math.random() * (max - min + 1));

}

function vectorLength(a, b) {

	return Math.sqrt(Math.pow((b.x || b[0]) - (a.x || a[0]), 2) + Math.pow((b.y || b[1]) - (a.y || a[1]), 2));

}

function anglePoint(fromX, fromY, x, y) {

	var angle = Math.atan2(fromY - y, x - fromX) * CONST.DEG;

	return (angle < 0) ? angle + 360 : angle;

}
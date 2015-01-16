/*

	uranEngine 
	Current version: v1.2.1
	www.uranengine.ru 

*/



window.requestAnimFrame = (function() {

	return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	window.oRequestAnimationFrame || 
	window.msRequestAnimationFrame || 
	function(callback) {
		window.setTimeout(callback, 1000/60);
	};

})();

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
		polygons: [],
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
			frames: 0,
			getFrame: 1,
			pause: 5,
			update: 0
		}
		// ...
	};

	this.property = {
		fasten: false,
		sprite: null,
		health: 100,
		collision: false,
		speed: 2,
		polygons: [],
		position: {
			x: 0,
			y: 0
		},
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

			this.property.size = {
				width: property.size[0] || this.property.size.width,
				height: property.size[1] || this.property.size.height
			};

			this.data.polygons = this.property.polygons = [
				[ 0, 0 ],
				[ this.property.size.width, 0 ],
				[ this.property.size.width, this.property.size.height ],
				[ 0, this.property.size.height ]
			];
			this.data.polygons.push([ 0, 0 ]);

			__updateOffset(this);

		}

		// Установка полигонов объекта

		if(typeof property.polygons == 'object') {

			if(property.polygons.length < 3) {
				console.warn('Количество полигонов не может быть меньше трех');
			} else {

				this.data.polygons = this.property.polygons = property.polygons;
				this.data.polygons.push(this.data.polygons[0]);

				for(var k = 0; k < property.polygons.length; ++k) {
					this.property.size.width = (this.property.size.width < property.polygons[k][0]) ? 
						property.polygons[k][0] : this.property.size.width;
					this.property.size.height = (this.property.size.height < property.polygons[k][1]) ? 
						property.polygons[k][1] : this.property.size.height;
				}

				__updateOffset(this);

			}

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

		if(typeof property.speed == 'number') {

			this.property.speed = ((property.speed < 1) ? 1 : ((property.speed > 10) ? 10 : property.speed));

		}

		// Установка координат объекта

		if(typeof property.position == 'object') {

			var newPosition = {
				_x: (typeof property.position[0] == 'number') ? property.position[0] : this.property.position.x,
				_y: (typeof property.position[1] == 'number') ? property.position[1] : this.property.position.y
			};

			var offset = __getObjectPositionOffset(this, {
				x: newPosition._x,
				y: newPosition._y
			});

			if((offset.left < 0 || offset.right > WORLD.element.width || offset.top < 0 || offset.bottom > WORLD.element.height) 
			&& this.property.fasten) {
				return this;
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

	animate: function(sprite, pause, infinity) {

		if(!WORLD.sprites[sprite]) {
			console.warn('Спрайт ' + sprite + ' не найден в кэше игры');
		} else {
			
			this.data.animate = {
				sprite: WORLD.sprites[sprite],
				infinity: infinity,
				animated: true,
				frames: Math.floor(WORLD.sprites[sprite].width/this.property.size.width),
				getFrame: 1,
				pause: pause || 5,
				update: 0
			};

		}

		return this;

	},

	// Передвижение объекта

	move: function(method) {

		if(!this.has()) {
			return;
		}

		var newPosition = {
			x: this.property.position.x+this.property.speed*method[0],
			y: this.property.position.y+this.property.speed*method[1]
		};

		this.set({
			position: [ 
				newPosition.x,
				newPosition.y
			]
		});

		EVENTS['move'].call(this, {
			object: this,
			position: newPosition
		});

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

				EVENTS['collision'].call(object, {
					object: object,
					actor: OBJECTS[i]
				});

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

	for(var k = 0; k < object.data.polygons.length-1; ++k) {

		if(__isPositionInPolygon(offset.left+object.data.polygons[k][0], offset.top+object.data.polygons[k][1], getObject)) {
			return true;
		}

		if(__isLineIntersectObject([
			offset.left+object.data.polygons[k][0], 
			offset.top+object.data.polygons[k][1]
		], [
			offset.left+object.data.polygons[k+1][0], 
			offset.top+object.data.polygons[k+1][1]
		], getObject)) {
			return true;
		}

	}

	function __isLineIntersectObject(A_start, A_end, _object) {

		for(var k = 0; k < _object.data.polygons.length-1; ++k) {

			var B_start = [
					_object.data.offset.left+_object.data.polygons[k][0], 
					_object.data.offset.top+_object.data.polygons[k][1]
				],
				B_end = [
					_object.data.offset.left+_object.data.polygons[k+1][0], 
					_object.data.offset.top+_object.data.polygons[k+1][1]
				];

			if(
				(((B_end[0]-B_start[0])*(A_start[1]-B_start[1])-(B_end[1]-B_start[1])*(A_start[0]-B_start[0])) *
				((B_end[0]-B_start[0])*(A_end[1]-B_start[1])-(B_end[1]-B_start[1])*(A_end[0]-B_start[0]))) < 0 && 
				(((A_end[0]-A_start[0])*(B_start[1]-A_start[1])-(A_end[1]-A_start[1])*(B_start[0]-A_start[0])) *
				((A_end[0]-A_start[0])*(B_end[1]-A_start[1])-(A_end[1]-A_start[1])*(B_end[0]-A_start[0]))) < 0
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

	for(var i = 0, j = _object.property.polygons.length-1; i < _object.property.polygons.length; j = i++) {

		x = [
			_object.data.offset.left+_object.property.polygons[i][0],
			_object.data.offset.left+_object.property.polygons[j][0]
		];
		y = [
			_object.data.offset.top+_object.property.polygons[i][1],
			_object.data.offset.top+_object.property.polygons[j][1]
		];

		if(((y[0] > _y) != (y[1] > _y)) && (_x < (x[1]-x[0])*(_y-y[0])/(y[1]-y[0])+x[0])) {
			inside = !inside;
		} 

	}

	return inside;

}

function __getObjectPositionOffset(object, position) {

	return {
		left: position.x - object.property.size.width/2,
		right: position.x + object.property.size.width/2,
		top: position.y - object.property.size.height/2,
		bottom: position.y + object.property.size.height/2
	}

}

function __updateOffset(object) {

	object.data.offset = {
		left: object.property.position.x - object.property.size.width/2,
		right: object.property.position.x + object.property.size.width/2,
		top: object.property.position.y - object.property.size.height/2,
		bottom: object.property.position.y + object.property.size.height/2
	};

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
		WORLD.canvas.lineWidth = 1;
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
					WORLD.element.width-WORLD.map.position[i][0], 
					WORLD.element.height-WORLD.map.position[i][1],
					WORLD.map.position[i][0], 
					WORLD.map.position[i][1],
					WORLD.element.width-WORLD.map.position[i][0], 
					WORLD.element.height-WORLD.map.position[i][1]
				);
			}

		}

	}

}

// Движение карты

function moveMap(method, speed) {

	if(!WORLD.map) {
		return;
	}

	if(!WORLD.map.position[1]) {
		if(method[0] < 0) {
			WORLD.map.position[1] = [ WORLD.element.width, 0 ];
		} else if(method[0] > 0) {
			WORLD.map.position[1] = [ -WORLD.element.width, 0 ];
		} else if(method[1] < 0) {
			WORLD.map.position[1] = [ 0, WORLD.element.height ];
		} else if(method[1] > 0) {
			WORLD.map.position[1] = [ 0, -WORLD.element.height ];
		}
	}

	for(var i = 0; i < 2; ++i) {
		WORLD.map.position[i][0] += speed * method[0];
		WORLD.map.position[i][1] += speed * method[1];
	}

	for(var i = 0; i < 2; ++i) {
		if(WORLD.map.position[i][0]+WORLD.element.width <= 0) {
			WORLD.map.position[i][0] = WORLD.element.width;
		}
		if(WORLD.map.position[i][0] >= WORLD.element.width) {
			WORLD.map.position[i][0] = -WORLD.element.width;
		}
		if(WORLD.map.position[i][1]+WORLD.element.height <= 0) {
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

	for(var i in OBJECTS) {

		EVENTS['update'].call(OBJECTS[i], {
			object: OBJECTS[i]
		});

		if(!OBJECTS[i].isVisible()) {
			continue;
		}

		if(OBJECTS[i].data.animate.animated) {

			WORLD.canvas.drawImage(
				OBJECTS[i].data.animate.sprite, 
				(OBJECTS[i].data.animate.getFrame-1)*OBJECTS[i].property.size.width, 0,
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height,
				OBJECTS[i].data.offset.left, 
				OBJECTS[i].data.offset.top,
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
				OBJECTS[i].property.sprite, 0, 0,
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height,
				OBJECTS[i].data.offset.left, 
				OBJECTS[i].data.offset.top,
				OBJECTS[i].property.size.width, 
				OBJECTS[i].property.size.height
			);

		} else if(OBJECTS[i].property.polygons.length > 2) {

			WORLD.canvas.beginPath();

			for(var k = 0; k < OBJECTS[i].data.polygons.length-1; ++k) {
				WORLD.canvas.moveTo(
					OBJECTS[i].data.offset.left+OBJECTS[i].data.polygons[k][0], 
					OBJECTS[i].data.offset.top+OBJECTS[i].data.polygons[k][1]
				);
				WORLD.canvas.lineTo(
					OBJECTS[i].data.offset.left+OBJECTS[i].data.polygons[k+1][0], 
					OBJECTS[i].data.offset.top+OBJECTS[i].data.polygons[k+1][1]
				);
			}

			WORLD.canvas.stroke();

		}

	}

	for(var i in HUD) {

		if(!HUD[i].text.length || !HUD[i].property.toggle) {
			continue;
		}

		WORLD.canvas.textAlign = HUD[i].property.align;
		WORLD.canvas.fillStyle = HUD[i].property.color;
		WORLD.canvas.font = (HUD[i].property.bold ? 'bold ' : '') + HUD[i].property.size + 'px ' + HUD[i].property.font;
		WORLD.canvas.fillText(HUD[i].text, HUD[i].property.position.x, HUD[i].property.position.y);

	}

	for(var key in keyController.has) {

		if(keyController.has[key] && keyController.callback.has) {
			keyController.callback.has(key);
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

var eventList = [
	'move', 'collision', 'death', 'enter', 'leave', 'update'
];

for(var i = 0; i < eventList.length; ++i) {
	new _event(eventList[i]);
}

delete eventList;

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
				x: (typeof property.position[0] == 'number') ? property.position[0] : this.property.position.x,
				y: (typeof property.position[1] == 'number') ? property.position[1] : this.property.position.y
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
		clickObject: null,
		click: null
	}

};

/*
**	Контроллер клавиш
*/

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

	if(keyController.callback.clickObject) {
		
		for(var i in OBJECTS) {

			if(__isPositionInPolygon(event.pageX, event.pageY, OBJECTS[i])) {

				keyController.callback.clickObject({
					object: OBJECTS[i],
					position: {
						x: event.pageX,
						y: event.pageY
					}
				});

			}

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

// Событие клика по объекту

function onClickedObject(callback) {

	keyController.callback.clickObject = callback;

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
module.exports = function(library, settings, scenes, uniq, cache, io) {

	// Класс объекта

	function class_object(scene, name) {

		this.type = 'object';
		this.name = name;
		this.scene = scene.id;
		this.id = ++uniq;
		this.debug = false;
		this.build = true;

		this.data = {
			polygons: {
				points: [],
				size: {
					height: 0,
					width: 0
				}
			},
			inobject: [],
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
			mouse: [],
			braking: {
				x: null,
				y: null
			}
		};

		this.property = {
			sprite: null,
			background: null,
			collision: false,
			// TODO
			mirror: {
				x: false,
				y: false
			}, 
			velocity: {
				x: settings.default.velocity,
				y: settings.default.velocity
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
		
		scenes[this.scene].list.object.push(this);
		library._sortByIndex(scenes[this.scene].list.object);

	}

	// Методы объекта

	class_object.prototype = {

		/**
		 * Удаление
		 *
		 * @return void
		 */

		destroy: function() {

			for(var i = 0; i < scenes[this.scene].list.player.length; ++i) {
				if(library.inArray(this.data.mouse, scenes[this.scene].list.player[i].id)) {

					library.deleteArrayValue(this.data.mouse, scenes[this.scene].list.player[i].id);

					library._callEvent('onObjectMouseLeave', this, [ 
						scenes[this.scene].list.player[i]
					]);

				}
			}

			for(var i = 0; i < scenes[this.scene].list.object.length; ++i) {
				if(library.inArray(scenes[this.scene].list.object[i].data.inobject, this.id)) {

					library.deleteArrayValue(scenes[this.scene].list.object[i].data.inobject, this.id);

					library._callEvent('onObjectLeave', this, [
						scenes[this.scene].list.object[i]
					]);

				}
			}

			library._callEvent('onObjectDestroy', this);

			library.deleteArrayValue(scenes[this.scene].list.object, this);
			library.clearObject(this);

		},

		/**
		 * Установка свойтв
		 *
		 * @param string property - Название свойства
		 * @param mixed value - Значение свойства
		 *
		 * 	[ пример 1 ]
		 *
		 * 	object.set('angle', 90);
		 *
		 * 	[ пример 2 ]
		 *
		 * 	object.set({
		 *		angle: 90,
		 *		sprite: 'player.png'
		 * 	});
		 *
		 * @return object this
		 */

		set: function(property, value) {

			if(typeof property == 'string' && typeof value != 'undefined') {

				var localProperty = {};
				localProperty[property] = value;

				return this.set(localProperty);

			} else if(typeof property != 'object') {
				return console.echo('warn', 'Неверный формат функции set'), this;
			}

			/**
			 * Свойство: Размер
			 *
			 * @format: N или { width: N } или { height: N } или { width: N, height: N }
			 *
			 * @type object
			 */

			if(typeof property.size == 'object') {

				this.property.size = {
					width: (typeof property.size.width == 'number') ?
						property.size.width << 0 :
						this.property.size.width,
					height: (typeof property.size.height == 'number') ?
						property.size.height << 0 :
						this.property.size.height
				};

				this.data.offset = this.getOffset();

				if(!this.property.polygons.length) {

					this.data.polygons.size = this.property.size;

					this.property.polygons = [
						[ 0, 0 ],
						[ this.property.size.width, 0 ],
						[ this.property.size.width, this.property.size.height ],
						[ 0, this.property.size.height ]
					];

				}
				
				updateObjectPolygons(this);

			} else if(typeof property.size == 'number') {
			
				this.set({
					size: {
						width: property.size,
						height: property.size
					}
				});

			}

			/**
			 * Свойство: Полигоны
			 *
			 * @format: [ [ N, N ], [ N, N ], [ N, N ], ... ]
			 *
			 * @type object
			 */

			if(typeof property.polygons == 'object') {

				if(property.polygons.length < 3) {
					console.echo('warn', 'Неверное значение свойства polygons');
				} else {

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

					this.property.polygons = library.cloneObject(property.polygons);

					if(this.property.size.width === 0 && this.property.size.height === 0) {
						this.property.size = this.data.polygons.size;
						this.data.offset = this.getOffset();
					}

					updateObjectPolygons(this);

				}

			}

			/**
			 * Свойство: Угол поворота
			 *
			 * @format: Диапазон от 0.0 до 360.0
			 *
			 * @type number
			 */

			if(typeof property.angle == 'number') {

				if(property.angle > 360) {
					property.angle -= 360;
				} else if(property.angle < -360) {
					property.angle += 360;
				}

				this.data.angle = (this.property.angle = property.angle) * -library.RAD;

				updateObjectPolygons(this);

			}

			/**
			 * Свойство: Изображение фона
			 *
			 * @type string / null
			 */

			if(typeof property.sprite == 'string') {

				if(cache.sprites.indexOf(property.sprite) == -1) {
					console.echo('warn', 'Спрайт ' + property.sprite + ' не найден в кэше игры');
				} else {

					this.property.sprite = property.sprite;

					this.data.animate.animated = false;

				}

			} else if(property.sprite === null) {
				this.property.sprite = null;
			}

			/**
			 * Свойство: Цвет фона
			 *
			 * @type string / null
			 */

			if(typeof property.background == 'string') {
				this.property.background = property.background;
			} else if(property.background === null) {
				this.property.background = null;
			}

			/**
			 * Свойство: Флаг осязаемости
			 *
			 * @type boolean
			 */

			if(typeof property.collision == 'boolean') {
				this.property.collision = property.collision;
			}

			/**
			 * Свойство: Флаг состояния
			 *
			 * @type boolean
			 */

			if(typeof property.toggle == 'boolean') {
				this.property.toggle = property.toggle;
			}

			/**
			 * Свойство: Непрозрачность
			 *
			 * @format: Диапазон от 0.0 до 1.0
			 *
			 * @type number
			 */

			if(typeof property.opacity == 'number') {
				this.property.opacity = property.opacity;
			}

			/**
			 * Свойство: Индекс слоя
			 *
			 * @type number
			 */

			if(typeof property.index == 'number') {

				this.property.index = property.index;

				library._sortByIndex(scenes[this.scene].list.object);

			}

			/**
			 * Свойство: Скорость
			 *
			 * @format: N или { x: N } или { y: N } или { x: N, y: N }
			 *
			 * @type object
			 */

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
			
				this.set({
					velocity: {
						x: property.velocity,
						y: property.velocity
					}
				});

			}

			/**
			 * Свойство: Позиция
			 *
			 * @format: { x: N } или { y: N } или { x: N, y: N }
			 *
			 * @type object
			 */

			if(typeof property.position == 'object') {

				var collision = collisionProcess(this, property.position, true);

				if(collision === false || (collision && typeof property.position.strictly == 'undefined')) {

					var prev = {
						x: this.property.position.x,
						y: this.property.position.y
					};

					this.property.position = {
						x: (typeof property.position.x == 'number') ?
							property.position.x << 0 :
							this.property.position.x,
						y: (typeof property.position.y == 'number') ?
							property.position.y << 0 :
							this.property.position.y
					};

					this.data.offset = this.getOffset();

					updateObjectPolygons(this);

					if(!this.build) {
						library._callEvent('onObjectMove', this, [ 
							property.position,
							prev
						]);
					}

				}

			}

			return this;

		},

		/**
		 * Получение значения свойства
		 *
		 * @param string key - Название свойства
		 *
		 * @return mixed value
		 */

		get: function(key) {

			return library.cloneObject(this.property[key]);

		},
		
		/**
		 * Установка внешнего свойства
		 *
		 * @param string key - Ключ свойства
		 * @param mixed value - Значение свойства
		 *
		 * @return object this
		 */

		setData: function(key, value) {

			if(typeof value == 'undefined') {
				delete this.property.data[key];
			} else {
				this.property.data[key] = value;
			}

			return this;

		},
		
		/**
		 * Получение внешнего свойства
		 *
		 * @param string key - Ключ свойства
		 *
		 * @return mixed value
		 */

		getData: function(key) {

			return this.property.data[key];

		},

		/**
		 * Клонирование
		 *
		 * @return object object
		 */

		clone: function() {

			return new class_object(this.name).set(this.property);

		},
		
		/**
		 * Проверка на отображение определенному игроку
		 *
		 * @return boolean
		 */

		isRender: function(player) {

			var screenCenter = {
				x: scenes[this.scene].scheme.screen.size.width / 2,
				y: scenes[this.scene].scheme.screen.size.height / 2
			};

			return (
				player.scene === this.scene &&
				this.property.size.width > 0 &&
				this.property.size.height > 0 &&
				this.property.toggle &&
				this.property.opacity > 0 &&
				library.isOffsetInOffset(this.data.offset, {
					left: player.camera.x - screenCenter.x,
					right: player.camera.x + screenCenter.x,
					top: player.camera.y - screenCenter.y,
					bottom: player.camera.y + screenCenter.y
				})
			);

		},

		/**
		 * Проверка на вхождение в указанные координаты
		 *
		 * @param object position - Координаты
		 *
		 * @return boolean
		 */

		isLocated: function(position) {

			return library.isPointInPolygons(position, this.data.polygons.points);

		},
		
		/**
		 * Получение координат границ объекта
		 *
		 * @return object offset
		 */

		getOffset: function() {

			return {
				left: this.property.position.x - this.property.size.width / 2,
				right: this.property.position.x + this.property.size.width / 2,
				top: this.property.position.y - this.property.size.height / 2,
				bottom: this.property.position.y + this.property.size.height / 2
			};

		},

		/**
		 * Получение текущей сцены
		 *
		 * @return object scene
		 */

		getScene: function() {

			return scenes[this.scene];

		},

		/**
		 * Проверка на доступность размещения в указаннх координатах
		 *
		 * @param object position - Координаты
		 *
		 * @return boolean
		 */

		isCanPlace: function(position) {

			return !collisionProcess(this, position, false);

		},
		
		/**
		 * Анимация объекта
		 *
		 * @param string sprite - Изображение анимации
		 * @param number frames - Количество кадров
		 * @param number pause - Пауза между кадрами
		 * @param boolean infinity - Флаг бесконечности
		 *
		 * @return object this
		 */

		animate: function(sprite, frames, pause, infinity) {

			if(cache.sprites.indexOf(sprite) == -1) {
				return console.echo('warn', 'Спрайт ' + sprite + ' не найден в кэше игры'), this;
			}
				
			this.data.animate = {
				sprite: sprite,
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

			return this;

		},
		
		/**
		 * Перемещение по углу
		 *
		 * @param number angle - Угол
		 *
		 * @return object this
		 */

		move: function(angle) {

			var cos = Math.cos(angle * -library.RAD),
				sin = Math.sin(angle * -library.RAD);

			if(cos === 0 && sin === 0) {
				return this;
			}

			// TODO
			var newPosition = {
				x: (this.property.position.x + (this.data.braking.x || this.property.velocity.x) * cos) << 0,
				y: (this.property.position.y + (this.data.braking.y || this.property.velocity.y) * sin) << 0,
				strictly: true
			};

			this.data.braking = {
				x: null,
				y: null
			};

			return this.set({
				position: newPosition
			});

		},

		/**
		 * Перемещение по координатам
		 *
		 * @param object position - Координаты
		 *
		 * @return object this
		 */

		moveTo: function(position) {

			if(this.property.position.x === position.x && this.property.position.y === position.y) {
				return this;
			}

			// TODO
			var vector = library.vectorLength(this.property.position, position);

			if(vector < this.property.velocity.x) {
				this.data.braking.x = vector;
			}
			if(vector < this.property.velocity.y) {
				this.data.braking.y = vector;
			}

			return this.move(library.anglePoint(this.property.position, position));

		}

	};

	// Системные функции объекта

	function collisionProcess(object, position, event) {

		if(!object.property.toggle) {
			return false;
		}

		var differenceOffset = {
			x: (object.property.position.x - position.x) << 0,
			y: (object.property.position.y - position.y) << 0
		};

		var localOffset = {
			left: object.data.offset.left - differenceOffset.x,
			right: object.data.offset.right - differenceOffset.x,
			top: object.data.offset.top - differenceOffset.y,
			bottom: object.data.offset.bottom - differenceOffset.y
		};

		var isCollisioned = false;

		if(!library.isOffsetInOffset(localOffset, {
			left: 0,
			right: scenes[object.scene].scheme.map.size.width,
			top: 0,
			bottom: scenes[object.scene].scheme.map.size.height
		}, true)) {

			isCollisioned = true;
			
			if(event) {

				library._callEvent('onObjectCollisionMap', object);

				if(!object.id) {
					return undefined;
				}

			}

		}

		for(var i = 0; i < scenes[object.scene].list.object.length; ++i) {

			if(object == scenes[object.scene].list.object[i] || !scenes[object.scene].list.object[i].property.toggle) {
				continue;
			}

			if(isObjectCollision(object, scenes[object.scene].list.object[i], localOffset, differenceOffset)) {
				
				if(object.property.collision && scenes[object.scene].list.object[i].property.collision) {

					isCollisioned = true;
					
					if(event) {
						library._callEvent('onObjectCollision', object, [
							scenes[object.scene].list.object[i]
						]);
					}

				} else if(!library.inArray(object.data.inobject, scenes[object.scene].list.object[i].id)) {

					object.data.inobject.push(scenes[object.scene].list.object[i].id);

					if(event) {
						library._callEvent('onObjectEnter', object, [
							scenes[object.scene].list.object[i]
						]);
					}

				}

			} else if(library.inArray(object.data.inobject, scenes[object.scene].list.object[i].id)) {

				library.deleteArrayValue(object.data.inobject, scenes[object.scene].list.object[i].id);

				if(event) {
					library._callEvent('onObjectLeave', object, [
						scenes[object.scene].list.object[i]
					]);
				}

			}

			if(event && !object.id) {
				return undefined;
			}

		}

		return isCollisioned;

	}

	function isObjectCollision(object, checkObject, localOffset, differenceOffset) {

		if(!library.isOffsetInOffset(localOffset, checkObject.data.offset)) {
			return false;
		}

		var localPolygons = [];

		for(var i = 0; i < object.data.polygons.points.length; ++i) {

			localPolygons[i] = [
				object.data.polygons.points[i][0] - differenceOffset.x,
				object.data.polygons.points[i][1] - differenceOffset.y
			];

			if(i == object.data.polygons.points.length - 1) {
				break;
			}

			if(library.isPointInPolygons({
				x: localPolygons[i][0],
				y: localPolygons[i][1]
			}, checkObject.data.polygons.points)) {
				return true;
			}
			
		}

		for(var i = 0; i < checkObject.data.polygons.points.length - 1; ++i) {

			if(library.isPointInPolygons({
				x: checkObject.data.polygons.points[i][0],
				y: checkObject.data.polygons.points[i][1]
			}, localPolygons)) {
				return true;
			}
			
		}

		return false;

	}

	function updateObjectPolygons(object, move) {

		var scale = [
			object.data.polygons.size.width / object.property.size.width,
			object.data.polygons.size.height / object.property.size.height
		];

		var sin = Math.sin(object.data.angle),
			cos = Math.cos(object.data.angle);

		var center = [
			object.property.size.width / 2,
			object.property.size.height / 2
		];

		var temp = [];

		object.data.polygons.points = [];

		for(var i = 0; i < object.property.polygons.length; ++i) {

			temp = [
				(object.property.polygons[i][0] / scale[0]) - center[0],
				(object.property.polygons[i][1] / scale[1]) - center[1]
			];

			object.data.polygons.points[i] = [
				(object.data.offset.left + center[0] + (temp[0] * cos - temp[1] * sin)) << 0,
				(object.data.offset.top + center[1] + (temp[0] * sin + temp[1] * cos)) << 0
			];

		}

		object.data.polygons.points.push(object.data.polygons.points[0]);

		return true;

	}

	return class_object;

};

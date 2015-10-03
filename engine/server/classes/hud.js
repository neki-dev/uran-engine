module.exports = function(library, settings, scenes, uniq, cache, io) {

	// Класс HUD

	function class_hud(scene, name) {

		this.type = 'hud';
		this.name = name;
		this.scene = scene.id;
		this.id = ++uniq;
		this.debug = false;
		this.build = true;

		this.data = {
			mouse: [],
			offset: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0
			},
			angle: 0,
			size: {
				width: 0,
				height: 0
			},
			startLeft: 0,
			textStartLeft: 0,
			polygons: {
				points: [],
				local: []
			}
		};

		this.property = {
			text: '',
			textColor: settings.default.textcolor,
			textSize: settings.default.textsize,
			textFont: settings.default.textfont,
			textStyle: settings.default.textstyle,
			textPadding: [ 0, 0, 0, 0 ],
			sprite: null,
			toggle: true,
			align: settings.default.align,
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
			data: [],
			index: 1
		}
		
		scenes[this.scene].list.hud.push(this);
		library._sortByIndex(scenes[this.scene].list.hud);

	}

	// Методы HUD

	class_hud.prototype = {
		
		/**
		 * Удаление
		 *
		 * @return void
		 */

		destroy: function() {

			for(var i = 0; i < scenes[this.scene].list.player.length; ++i) {
				if(library.inArray(this.data.mouse, scenes[this.scene].list.player[i].id)) {

					library.deleteArrayValue(this.data.mouse, scenes[this.scene].list.player[i].id);

					library._callEvent('onHudMouseLeave', this, [ 
						scenes[this.scene].list.player[i]
					]);

				}
			}

			library._callEvent('onHudDestroy', this);

			library.deleteArrayValue(scenes[this.scene].list.hud, this);
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
		 * 	hud.set('background', '#000');
		 *
		 * 	[ пример 2 ]
		 *
		 * 	hud.set({
		 *		background: '#000',
		 *		opacity: 0.6
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
			 * Свойство: Текст
			 *
			 * @type string
			 */

			if(typeof property.text == 'string') {
				this.property.text = property.text;
			}

			/**
			 * Свойство: Цвет текста
			 *
			 * @type string
			 */

			if(typeof property.textColor == 'string') {
				this.property.textColor = property.textColor;
			}

			/**
			 * Свойство: Размер текста
			 *
			 * @type number
			 */

			if(typeof property.textSize == 'number') {
				this.property.textSize = property.textSize;
			}

			/**
			 * Свойство: Шрифт текста
			 *
			 * @type string
			 */

			if(typeof property.textFont == 'string') {
				this.property.textFont = property.textFont;
			}

			/**
			 * Свойство: Стиль текста
			 *
			 * @type string
			 */

			if(typeof property.textStyle == 'string') {
				this.property.textStyle = property.textStyle;
			}

			/**
			 * Свойство: Отступы текста
			 *
			 * @format: N или [ N ] или [ N, N ] или [ N, N, N, N ]
			 *
			 * @type object / number
			 */

			if(typeof property.textPadding == 'object') {

				switch(property.textPadding.length) {
					case 4:
						this.property.textPadding = property.textPadding;
					break;
					case 2:
						this.property.textPadding = [ 
							property.textPadding[0],
							property.textPadding[1],
							property.textPadding[0],
							property.textPadding[1]
						];
					break;
					case 1:
						this.property.textPadding = [ 
							property.textPadding[0],
							property.textPadding[0],
							property.textPadding[0],
							property.textPadding[0]
						];
					break;
					default:
						console.echo('warn', 'Неверный формат свойства textPadding');
					break;
				}
				
			} else if(typeof property.textPadding == 'number') {

				this.set({
					textPadding: [ 
						property.textPadding, 
						property.textPadding, 
						property.textPadding, 
						property.textPadding
					]
				});

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

				if(property.opacity < 0) {
					property.opacity = 0;
				} else if(property.opacity > 1) {
					property.opacity = 1;
				}

				this.property.opacity = property.opacity;

			}

			/**
			 * Свойство: Индекс слоя
			 *
			 * @type number
			 */

			if(typeof property.index == 'number') {

				this.property.index = property.index;

				library._sortByIndex(scenes[this.scene].list.hud);

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
			 * Свойство: Изображение фона
			 *
			 * @type string / null
			 */

			if(typeof property.sprite == 'string') {

				if(cache.sprites.indexOf(property.sprite) == -1) {
					console.echo('warn', 'Спрайт ' + property.sprite + ' не найден в кэше игры');
				} else {
					this.property.sprite = property.sprite;
				}

			} else if(property.sprite === null) {
				this.property.sprite = null;
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

			}

			/**
			 * Свойство: Расположенение текста
			 *
			 * @format: 'left' или 'center' или 'right'
			 *
			 * @type string
			 */

			if(typeof property.align == 'string') {

				switch(property.align) {
					case 'left':
					case 'center':
					case 'right':
						this.property.align = property.align;
					break;
					default:
						console.echo('warn', 'Неверное значение свойства align');
					break;
				}	
				
			}

			/**
			 * Свойство: Позиция
			 *
			 * @format: { x: N } или { y: N } или { x: N, y: N }
			 *
			 * @type object
			 */

			if(typeof property.position == 'object') {

				this.property.position = {
					x: (typeof property.position.x == 'number') ?
						((property.position.x < 0) ?
							(scenes[this.scene].scheme.screen.size.width + property.position.x) << 0 :
							property.position.x << 0) :
						this.property.position.x,
					y: (typeof property.position.y == 'number') ?
						((property.position.y < 0) ?
							(scenes[this.scene].scheme.screen.size.height + property.position.y) << 0 :
							property.position.y << 0) :
						this.property.position.y
				};
				
			}

			/**
			 * Свойство: Размер
			 *
			 * @format: { x: N } или { y: N } или { x: N, y: N }
			 *
			 * @type object
			 */

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
				
			} else if(typeof property.size == 'number') {
			
				this.set({
					size: {
						width: property.size,
						height: property.size
					}
				});

			}

			updateHudData(this);

			return this;

		},

		/**
		 * Получение значения свойства
		 *
		 * @param mixed key - Свойство
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
		 * @return object hud
		 */

		clone: function() {

			return new class_hud(this.name).set(this.property);

		},
		
		/**
		 * Проверка на отображение
		 *
		 * @return boolean
		 */

		isRender: function() {

			return (
				this.data.size.width > 0 &&
				this.data.size.height > 0 &&
				this.property.toggle &&
				this.property.opacity > 0 &&
				library.isOffsetInOffset(this.data.offset, {
					left: 0,
					right: scenes[this.scene].scheme.screen.size.width,
					top: 0,
					bottom: scenes[this.scene].scheme.screen.size.height
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
		 * Получение координат границ HUD
		 *
		 * @return object offset
		 */

		getOffset: function() {

			return {
				left: this.property.position.x - this.data.startLeft,
				right: this.property.position.x - this.data.startLeft + this.data.size.width,
				top: this.property.position.y - this.data.size.height / 2,
				bottom: this.property.position.y + this.data.size.height / 2
			};

		},

		/**
		 * Получение текущей сцены
		 *
		 * @return object scene
		 */

		getScene: function() {

			return scenes[this.scene];

		}

	};

	// Системные функции HUD

	function updateHudData(hud) {

		// TODO
		hud.data.size.width = ((typeof hud.property.size.width == 'number') ? 
			hud.property.size.width :
			(hud.property.textSize * hud.property.text.length * settings.fontwidth) << 0)
			+ hud.property.textPadding[1] + hud.property.textPadding[3];

		hud.data.size.height = ((typeof hud.property.size.height == 'number') ? 
			hud.property.size.height :
			(hud.property.textSize * settings.fontheight) << 0) 
			+ hud.property.textPadding[0] + hud.property.textPadding[2];

		switch(hud.property.align) {
			case 'left':
				hud.data.startLeft = 0;
				hud.data.textStartLeft = hud.property.textPadding[3];
			break;
			case 'center':
				hud.data.startLeft = hud.data.size.width / 2;
				hud.data.textStartLeft = 0;
			break;
			case 'right':
				hud.data.startLeft = hud.data.size.width;
				hud.data.textStartLeft = -hud.property.textPadding[1];
			break;
		}

		hud.data.offset = hud.getOffset();

		hud.data.polygons.local = [
			[ 0, 0 ],
			[ hud.data.size.width, 0 ],
			[ hud.data.size.width, hud.data.size.height ],
			[ 0, hud.data.size.height ]
		];

		updateHudPolygons(hud);

	}

	function updateHudPolygons(hud) {

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
				(hud.data.offset.left + center[0] + (temp[0] * cos - temp[1] * sin)) << 0,
				(hud.data.offset.top + center[1] + (temp[0] * sin + temp[1] * cos)) << 0
			];

		}

		hud.data.polygons.points[hud.data.polygons.local.length] = hud.data.polygons.points[0];

	}

	return class_hud;

};
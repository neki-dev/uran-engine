module.exports = function(classes, library, settings, scenes, cache, io) {

	var file = require('fs'),
		parser = new require('xml2js').Parser();

	// Класс сцены

	var class_scene = function(name) {

		this.type = 'scene';
		this.name = 'Undefined';
		this.id = scenes.length;

		this.scheme = {
			screen: {
				size: {
					width: 0,
					height: 0
				},
				position: {
					x: 0,
					y: 0
				}
			},
			map: {
				size: {
					width: 0,
					height: 0
				},
				sprite: null
			}
		};

		this.list = {
			hud: [],
			object: [],
			player: []
		};

		scenes.push(this);

	}

	// Методы сцены

	class_scene.prototype = {

		/**
		 * Создание объекта
		 *
		 * @param string name - Имя
		 * @param object property - Объект свойств
		 *
		 * @return object object
		 */

		createObject: function(name, property) {

			if(typeof property == 'undefined') {
				property = name;
				name = 'Undefined';
			}

			var object = new classes.class_object(this, name);

			if(typeof property == 'object') {
				object.set(property);
			}

			delete object.build;

			library._callEvent('onObjectCreate', object);

			return object;

		},

		/**
		 * Создание HUD
		 *
		 * @param string name - Имя
		 * @param object property - Объект свойств
		 *
		 * @return object hud
		 */

		createHud: function(name, property) {

			if(typeof property == 'undefined') {
				property = name;
				name = 'Undefined';
			}

			var hud = new classes.class_hud(this, name);

			if(typeof property == 'object') {
				hud.set(property);
			}

			delete hud.build;

			library._callEvent('onHudCreate', hud);

			return hud;

		},

		/**
		 * Установка фона карты
		 *
		 * @param string sprite - Изображение
		 *
		 * @return object this
		 */

		setMapSprite: function(sprite) {

			if(cache.sprites.indexOf(sprite) == -1) {
				return console.echo('warn', 'Спрайт ' + sprite + ' не найден в кэше игры'), this;
			}

			this.scheme.map.sprite = sprite;

			for(var i = 0; i < this.list.player.length; ++i) {
				this.list.player[i].socket.emit('setMapSprite', sprite);
			}

			return this;

		},

		/**
		 * Получение фона карты
		 *
		 * @return string sprite
		 */

		getMapSprite: function() {

			return this.scheme.map.sprite;

		},

		/**
		 * Установка размеров карты
		 *
		 * @param object size - Размер
		 *
		 * @return object this
		 */

		setMapSize: function(size) {

			this.scheme.map.size = size;

			for(var i = 0; i < this.list.player.length; ++i) {
				this.list.player[i].socket.emit('setMapSize', size);
			}

			return this;

		},

		/**
		 * Получение размеров карты
		 *
		 * @return object size
		 */

		getMapSize: function() {

			return this.scheme.map.size;

		},

		/**
		 * Установка размеров видимой области
		 *
		 * @param object size - Размер
		 *
		 * @return object this
		 */

		setScreenSize: function(size) {

			this.scheme.screen.size = size;

			for(var i = 0; i < this.list.player.length; ++i) {
				this.list.player[i].socket.emit('setScreenSize', size);
			}

			return this;

		},

		/**
		 * Получение размеров видимой области
		 *
		 * @return object size
		 */

		getScreenSize: function() {

			return this.scheme.screen.size;

		}

	};

	return {

		/**
		 * Создание сцены
		 *
		 * @param string xml - XML файл конфигуаций сцены
		 * @param function callback - Функция обратного вызова
		 *
		 * @return object scene
		 */

		createScene: function(xml, callback) {

			if(typeof callback == 'undefined' && typeof xml == 'function') {
				callback = xml;
			}

			if(typeof xml != 'string') {
				xml = 'default.xml';
			}

			var scene = new class_scene();

			file.readFile('./scene/' + xml, function(error, data) {

				if(error) {
					console.echo('error', 'При открытии `' + xml + '` возникла ошибка');
					console.echo('hint', error);
					return undefined;
				}

				parser.parseString(data, function(error, result) {

					if(error) {
						console.echo('error', 'При чтении `' + xml + '` возникла ошибка');
						console.echo('hint', error);
						return undefined;
					}

					if(result.scheme.map[0].sprite[0].length) {
						scene.setMapSprite(result.scheme.map[0].sprite[0]);
					}

					scene.setMapSize({
						width: parseInt(result.scheme.map[0].size[0].width[0]),
						height: parseInt(result.scheme.map[0].size[0].height[0])
					});

					scene.scheme.screen = {
						size: {
							width: parseInt(result.scheme.screen[0].size[0].width[0]),
							height: parseInt(result.scheme.screen[0].size[0].height[0])
						},
						position: {
							x: parseInt(result.scheme.screen[0].position[0].x[0]),
							y: parseInt(result.scheme.screen[0].position[0].y[0])
						}
					};

					if(result.scheme.$) {
						scene.name = result.scheme.$.name || 'Undefined';
					}
 
					if(typeof callback != 'undefined') {
						callback.apply(scene, []);
					}

				});

			});

			library._callEvent('onSceneCreate', scene);

			return scene;

		}

	};

};
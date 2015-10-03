module.exports = function(library, settings, scenes, uniq, cache, io) {

	// Класс игрока

	function class_player(socket) {

		this.type = 'player';
		this.name = 'Undefined';
		this.id = ++uniq;

		this.socket = socket;
		this.scene = 0;
		this.camera = {
			x: 0,
			y: 0
		};

		this.data = [];

		scenes[0].list.player.push(this);

	}

	// Методы игрока

	class_player.prototype = {
		
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
				delete this.data[key];
			} else {
				this.data[key] = value;
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

			return this.data[key];

		},
		
		/**
		 * Воспроизведение звука
		 *
		 * @param string sound - Файл звука
		 * @param number volume - Громкость от 0.0 до 1.0
		 *
		 * @return object this
		 */

		playSound: function(sound, volume) {

			if(cache.sounds.indexOf(sound) == -1) {
				return console.echo('warn', 'Звук ' + sound + ' не найден в кэше игры'), this;
			}

			this.socket.emit('playSound', {
				sound: file,
				volume: volume || settings.default.volume
			});
			
			return this;

		},
		
		/**
		 * Установка типа курсора
		 *
		 * @param string cursor - Название типа курсора
		 *
		 * @return object this
		 */

		setCursor: function(cursor) {

			this.socket.emit('setCursor', cursor);
			
			return this;

		},
		
		/**
		 * Установка сцены
		 *
		 * @param object scene - Новая сцена
		 *
		 * @return object this
		 */

		setScene: function(scene) {

			if(this.scene === scene.id) {
				return this;
			}

			for(var i = 0; i < scenes[this.scene].list.object.length; ++i) {
				if(library.inArray(scenes[this.scene].list.object[i].data.mouse, this.id)) {

					library.deleteArrayValue(scenes[this.scene].list.object[i].data.mouse, this.id);

					library._callEvent('onObjectMouseLeave', scenes[this.scene].list.object[i], [ 
						this
					]);

				}
			}

			for(var i = 0; i < scenes[this.scene].list.hud.length; ++i) {
				if(library.inArray(scenes[this.scene].list.hud[i].data.mouse, this.id)) {

					library.deleteArrayValue(scenes[this.scene].list.hud[i].data.mouse, this.id);

					library._callEvent('onHudMouseLeave', scenes[this.scene].list.hud[i], [ 
						this
					]);

				}
			}

			scenes[this.scene].list.player.splice(scenes[this.scene].list.player.indexOf(this), 1);
			this.scene = scene.id;
			scenes[this.scene].list.player.push(this);

			this.camera = scene.scheme.screen.position;

			library._callEvent('onScenePlayerJoin', scene, [
				this
			]);

			this.socket.emit('setScene', {
				scene: scenes[this.scene].id,
				screen: {
					size: scenes[this.scene].scheme.screen.size,
					position: this.camera
				},
				map: {
					size: scenes[this.scene].scheme.map.size,
					sprite: scenes[this.scene].scheme.map.sprite
				}
			});

			return this;

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
		 * Установка позиции камеры на карте
		 *
		 * @param object position - Координаты
		 *
		 * @return object this
		 */

		setScreenPosition: function(position) {

			if(this.camera.x === position.x && this.camera.y === position.y) {
				return this;
			}

			if(
				this.camera.x != position.x &&
				position.x >= scenes[this.scene].scheme.screen.size.width / 2 &&
				position.x <= scenes[this.scene].scheme.map.size.width - scenes[this.scene].scheme.screen.size.width / 2
			) {
				this.camera.x = position.x;
			}

			if(
				this.camera.y != position.y &&
				position.y > scenes[this.scene].scheme.screen.size.height / 2 &&
				position.y < scenes[this.scene].scheme.map.size.height - scenes[this.scene].scheme.screen.size.height / 2
			) {
				this.camera.y = position.y;
			}

			this.socket.emit('setScreenPosition', this.camera);

			return this;

		},
		
		/**
		 * Получение позиции камеры на карте
		 *
		 * @return object position
		 */

		getScreenPosition: function() {

			return this.camera;

		}

	};

	return {

		/**
		 * Создание класса игрока
		 *
		 * @private
		 *
		 * @param object socket - Сокет
		 *
		 * @return object player
		 */

		_createPlayer: function(socket) {

			return new class_player(socket);

		}

	};

};
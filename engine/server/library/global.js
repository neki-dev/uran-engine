module.exports = function(library, settings, scenes, cache, io) {

	return {

		/**
		 * Проверка существования элемента
		 *
		 * @param object element - Элемент
		 *
		 * @return boolean
		 */

		there: function(element) {

			return (typeof element.id == 'number');

		},

		/**
		 * Выборка элементов по типу и имени
		 *
		 * @param string type - Тип элемента (player / hud / object)
		 * @param string name - Имя элемента
		 * @param object scene - Сцена поиска
		 *
		 * @return object list
		 */

		select: function(type, name, scene) {

			if(typeof name == 'object') {
				scene = name;
				name = undefined;
			}

			var data = [];

			if(typeof scene == 'undefined') {
				for(var i = 0; i < scenes.length; ++i) {
					data = data.concat(scenes[i].list[type]);
				}
			} else {
				data = scene.list[type];
			}

			var result = [];

			for(var i = 0; i < data.length; ++i) {
				if(data[i].name == name || typeof name == 'undefined') {
					result.push(data[i]);
				}
			}

			return result;

		},

		/**
		 * Поиск элемента по id
		 *
		 * @param number id - Id элемента
		 * @param object scene - Сцена поиска
		 *
		 * @return object element
		 */

		findFromId: function(id, scene) {

			var data = [];

			if(typeof scene == 'undefined') {
				for(var i = 0; i < scenes.length; ++i) {
					data = data.concat(scenes[i].list.object, scenes[i].list.hud, scenes[i].list.player);
				}
			} else {
				data = data.concat(scene.list.object, scene.list.hud, scene.list.player);
			}

			for(var i = 0; i < data.length; ++i) {
				if(data[i].id === id) {
					return data[i];
				}
			}

			return undefined;

		},

		/**
		 * Запись спрайтов в кеш игры
		 *
		 * @param object sprites - Массив файлов спрайтов
		 *
		 * @return void
		 */

		cacheSprites: function(sprites) {

			cache.sprites = cache.sprites.concat(sprites);

		},

		/**
		 * Запись звуков в кеш игры
		 *
		 * @param object sprites - Массив файлов звуков
		 *
		 * @return void
		 */

		cacheSounds: function(sounds) {

			cache.sounds = cache.sounds.concat(sounds);

		}

	};

};
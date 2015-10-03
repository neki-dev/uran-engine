var emitter = require('events').EventEmitter,
	emitter = new emitter();

module.exports = {

	/**
	 * Перехват события по ключу и фильтру
	 *
	 * @param string key - Ключ события
	 * @param string/object target - Фильтр события
	 * @param function callback - Функция обратного вызова
	 *
	 * @return void
	 */

	event: function(key, target, callback) {

		if(typeof callback == 'undefined') {
			callback = target;
			target = null;
		}

		emitter.on(key, function(data) {

			if(!target || target == data.target || target == data.target.name) {
				return callback.apply(data.target, data.params);
			}

		});

	},

	/**
	 * Вызов события по ключу и фильтру
	 *
	 * @private
	 *
	 * @param string key - Ключ события
	 * @param string/object target - Фильтр события
	 * @param object params - Массив аргументов
	 *
	 * @return boolean
	 */

	_callEvent: function(key, target, params) {

		if(typeof params == 'undefined') {
			params = [];
		}

		return emitter.emit(key, {
			target: target,
			params: params
		});

	}

};
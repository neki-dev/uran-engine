module.exports = function(frames) {

	var now = require('performance-now');

	var last = 0, 
		id = 0, 
		queue = [], 
		frameDuration = 1000 / frames;

	return {

		/**
		 * Запуск цикла
		 *
		 * @private
		 *
		 * @param function callback - Функция обратного вызова
		 *
		 * @return number id
		 */

		_loopStart: function(callback) {

			if(queue.length === 0) {

				var localNow = now(), 
					next = Math.max(0, frameDuration - (localNow - last));

				last = next + localNow;

				setTimeout(function() {

					var cp = queue.slice(0);
					queue.length = 0;

					for(var i = 0; i < cp.length; i++) {

						if(!cp[i].cancelled) {
							try {
								cp[i].callback(last);
							} catch(e) {
								setTimeout(function() { 
									throw e 
								}, 0);
							}
						}

					}

				}, Math.round(next));

			}

			queue.push({
				handle: ++id,
				callback: callback,
				cancelled: false
			});

			return id;

		},

		/**
		 * Остановка цикла
		 *
		 * @private
		 *
		 * @param number id - Id цикла
		 *
		 * @return void
		 */

		_loopStop: function(handle) {

			for(var i = 0; i < queue.length; i++) {
				if(queue[i].handle === handle) {
					queue[i].cancelled = true;
				}
			}

		}

	};

};
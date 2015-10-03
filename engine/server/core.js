module.exports = function(settings, io) {

	var scenes = [];	// Массив сцен

	var uniq = 0;		// Уникальный id

	var cache = {
		sprites: [],	// Кэш спрайтов
		sounds: []		// Кэш звуков
	};

	// Кастомизация логирования

	require('./library/console');
 
	// Загрузка функционала

	var library = require('./library')(settings, scenes, uniq, cache, io);

	// Регистрация сокетов

	require('./socket')(library, settings, scenes, cache, io);

	// Запуск статических процессов

	require('./process')(library, settings, scenes);

	// Экспорт функционала

	var exportLibrary = {};

	for(var f in library) {
		if(f[0] == '_') {
			continue;
		}
		exportLibrary[f] = library[f];
	}

	return exportLibrary;

};
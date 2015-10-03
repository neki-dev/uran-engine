module.exports = function(settings, scenes, uniq, cache, io) {

	// Загрузка системных функций

	var library = require('./library/tools.js');

	// Загрузка регистратора событий

	var events = require('./library/events.js');

	// Загрузка цикла отправки данных

	var loop = require('./library/loop.js')(settings.frames);
	
	library = library.concatObjects(library, events, loop);

	// Загрузка глобальных функций

	var global = require('./library/global.js')(library, settings, scenes, cache, io);
	
	library = library.concatObjects(library, global);

	// Загрузка класса сцены
	
	var scene = require('./classes/scene.js')({
		class_object: require('./classes/object.js')(library, settings, scenes, uniq, cache, io),
		class_hud: require('./classes/hud.js')(library, settings, scenes, uniq, cache, io)
	}, library, settings, scenes, cache, io);
	
	library = library.concatObjects(library, scene);

	// Загрузка класса игрока

	var player = require('./classes/player.js')(library, settings, scenes, uniq, cache, io);
	
	library = library.concatObjects(library, player);

	// Экспорт функционала

	return library;

};
/**
 * Очистка консоли
 *
 * @return void
 */

console.clear = function() {

	process.stdout.write('\u001b[2J\u001b[0;0H');
	console.log('');

};

/**
 * Вывод сообщения в консоль
 *
 * @param string type - Тип сообщения
 * @param string message - Текст сообщения
 *
 * @return void
 */

console.echo = function(type, message) {

	var date = new Date();

	var h = date.getHours(),
		m = date.getMinutes(),
		s = date.getSeconds();

	var color = '';

	switch(type) {
		case 'info':
			color = '\x1b[32m\x1b[1m';
		break;
		case 'warn':
			color = '\x1b[33m\x1b[1m';
		break;
		case 'error':
			color = '\x1b[31m\x1b[1m';
		break;
		case 'hint':
			color = '\x1b[0m\x1b[37m';
		break; 
		default:
			color = '\x1b[37m\x1b[1m';
		break;
	}

	message = '  \x1b[30m\x1b[1m[' + (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m + (s < 10 ? ':0' : ':') + s + '] ' + 
			  color + 
			  message + 
			  '\x1b[0m';

	console.log.apply(console, [ message ]);

};
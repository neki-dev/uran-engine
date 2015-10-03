var express = require('express'),
	io = require('socket.io'),
	settings = require('../settings');

// Запуск сервера

var app = express();
io = io(
	require('http').createServer(app).listen(process.env.PORT || settings.port)
);

// Распознование коренвой директории

settings.dir = /(.*)\\.*\\.*/.exec(__dirname)[1];

// Настройка маршрутизатора

app.set('views', settings.dir + '/template');
app.set('view engine', 'jade');
app.use(express.static(settings.dir));

// Маршрутизатор

app.get(settings.host, function(req, res) {
	res.render('index');
});

// Экспорт сервера

module.exports = {
	settings: settings,
	io: io
};
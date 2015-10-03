/**
 * uranEngine 2.0.0 (serverside)
 *
 * Движок для создания браузерных многопользовательских 2D игр.
 * Использует технологии Node.js, Socket.io, Canvas и позволяет Вам 
 * создать игру любого жанра, не имея глубоких знаний JavaScript.
 *
 * @author Essle Jaxcate <essle.55@yandex.ru>
 * @copyright 2014-2015 uranEngine, Inc. http://uranengine.ru
 * @license https://raw.githubusercontent.com/Essle/uranEngine/master/LICENSE
 */

// Загрузка сервера

var server = require('./server');

// Экспорт модулей

module.exports = require('./core')(server.settings, server.io);

module.exports.settings = server.settings;
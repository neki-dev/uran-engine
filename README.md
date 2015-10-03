# **uranEngine**
Это новый OpenSource движок для создания браузерных многопользовательских 2D игр.
Использует технологии Node.js, Socket.io, Canvas и позволяет Вам создать игру любого жанра, не имея глубоких знаний JavaScript.

**www.uranengine.ru**
* Загрузка: www.uranengine.ru/download
* Документация: www.uranengine.ru/manual
* Редактор: www.uranengine.ru/editor

### С чего начать?

1. Загрузите и установите [Node.js](https://nodejs.org)
1. Загрузите [последнюю версию](http://uranengine.ru/download) движка uranEngine.
1. Затем в распакованном архиве запустите файл install.bat и дождитесь установки всех модулей, необходимых для работы движка.
1. Теперь Вы можете приступить к разработке игры, открыв файл script.js в директории game.

### Структура кода

_Предварительный код_
```javascript
// Загрузка библиотеки
var $ = require('../engine/server/uranengine');

// Кеширование файлов игры
$.cacheSprites([ 
	'background.png', 
	//...
]);
$.cacheSounds([
	//...
]);
```
_Создание сцен_
```javascript
var sceneMain = $.createScene('main.xml', function() {
	//...
});
//...
```
_Регистрация событий_
```javascript
$.event('onPlayerConnect', function() {
	this.setScene(sceneMain);
	//...
});
//...
```
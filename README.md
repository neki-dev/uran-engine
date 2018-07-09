# **uranEngine**
Это новый OpenSource движок для создания браузерных многопользовательских 2D игр.
Использует технологии Node.js, Socket.io, Canvas и позволяет Вам создать игру любого жанра, не имея глубоких знаний JavaScript.

**www.uranengine.essle.ru**
* Загрузка: www.uranengine.essle.ru/download
* Документация: www.uranengine.essle.ru/manual
* Редактор: www.uranengine.essle.ru/editor

### С чего начать?

1. Загрузите и установите [Node.js](https://nodejs.org)
1. Загрузите [последнюю версию](http://uranengine.ru/download) движка uranEngine.
1. Затем в распакованном архиве запустите файл install.bat и дождитесь установки всех модулей, необходимых для работы движка.
1. Теперь Вы можете приступить к разработке игры, открыв файл script.js в директории game.
1. Для запуска игры запустите файл start.bat в директории game.

### Структура

_Сервер_
```javascript
// Загрузка библиотеки
var $ = require('../engine/server/uranengine');

// Код игры
// ...
```
_Клиент_
```html
<!-- Создание элемента Canvas -->
<canvas id='uranEngine'></canvas>

<!-- Загрузка функционала -->
<script type='text/javascript' src='/socket.io/socket.io.js'></script>
<script type='text/javascript' src='/engine/client/uranengine.js'></script>
```

// Константы градусов и радиан

var CONST = {

	RAD: Math.PI / 180,
	DEG: 180 / Math.PI

};

module.exports = {

	RAD: CONST.RAD,
	DEG: CONST.DEG,

	// Константы клавиш

	KEYS: {

		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		CAPSLOCK: 20,
		ESCAPE: 27,
		SPACE: 32,
		PAGEUP: 33,
		PAGEDOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		INSERT: 45,
		DELETE: 46,

		NUMBER: {
			'0': 48,
			'1': 49,
			'2': 50,
			'3': 51,
			'4': 52,
			'5': 53,
			'6': 54,
			'7': 55,
			'8': 56,
			'9': 57
		},

		F: {
			'1': 112,
			'2': 113,
			'3': 114,
			'4': 115,
			'5': 116,
			'6': 117,
			'7': 118,
			'8': 119,
			'9': 120,
			'10': 121,
			'11': 122,
			'12': 123	
		},

		LETTER: {
			'a': 65,
			'b': 66,
			'c': 67,
			'd': 68,
			'e': 69,
			'f': 70,
			'g': 71,
			'h': 72,
			'i': 73,
			'j': 74,
			'k': 75,
			'l': 76,
			'm': 77,
			'n': 78,
			'o': 79,
			'p': 80,
			'q': 81,
			'r': 82,
			's': 83,
			't': 84,
			'u': 85,
			'v': 86,
			'w': 87,
			'x': 88,
			'y': 89,
			'z': 90
		}
		
	},

	/**
	 * Объединение нескольнких объектов в один
	 *
	 * @param object ... - Объекты
	 *
	 * @return object objects
	 */

	concatObjects: function() {

		var object = {};

		for(var i = 0; i < arguments.length; ++i) {

			if(typeof arguments[i] != 'object') {
				continue;
			}

			for(var key in arguments[i]) {
				object[key] = arguments[i][key];
			}

		}

		return object;

	},

	/**
	 * Очистка свойств и методов объекта
	 *
	 * @param object object - Объект
	 *
	 * @return void
	 */

	clearObject: function(object) {

		if(typeof object != 'object') {
			return false;
		}

		for(var i in object) {
			delete object[i];
		}

		for(var i in object.__proto__) {
			object[i] = function() {
				return object;
			};
		}

	},

	/**
	 * Клонирование объекта
	 *
	 * @param object object - Объект
	 *
	 * @return object object
	 */

	cloneObject: function(object) {

		if(typeof object != 'object') {
			return object;
		}

		var temp = new object.constructor(); 

		for(var k in object) {
			temp[k] = (typeof object[k] == 'object') ?
				this.cloneObject(object[k]) :
				object[k];
		}

		return temp;

	},

	/**
	 * Проверяет наличине значение в массиве
	 *
	 * @param object array - Массив
	 * @param mixed value - Значение
	 *
	 * @return boolean
	 */

	inArray: function(array, value) {

		return (array.indexOf(value) != -1);

	},

	/**
	 * Удаляет значение из массива
	 *
	 * @param object array - Массив
	 * @param mixed value - Значение
	 *
	 * @return void
	 */

	deleteArrayValue: function(array, value) {

		var index = array.indexOf(value);

		if(index != -1) {
			array.splice(index, 1);
		}

	},

	/**
	 * Генерация случайного числа в указанном диапазоне
	 *
	 * @param number min - Минимальный диапазон
	 * @param number max - Максимальный диапазон
	 * @param boolean noround - Флаг округления числа
	 *
	 * @return number number
	 */

	random: function(min, max, noround) {

		var r = min - 0.5 + Math.random() * (max - min + 1);

		return noround ?
			r :
			Math.round(r);

	},

	/**
	 * Получение длины вектора
	 *
	 * @param object a - Координаты точки A
	 * @param object b - Координаты точки B
	 *
	 * @return number length
	 */

	vectorLength: function(a, b) {

		return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) << 0;

	},

	/**
	 * Проверка на вхождение первого оффсета во второй
	 *
	 * @param object a - Первый оффсет
	 * @param object b - Второй оффсет
	 * @param boolean strictly - Флаг строгости вхождения
	 *
	 * @return boolean
	 */

	isOffsetInOffset: function(a, b, strictly) {

		return strictly ? 
			(
				a.left >= b.left &&
				a.right <= b.right &&
				a.top >= b.top &&
				a.bottom <= b.bottom
			) :
			(
				a.right > b.left &&
				a.left < b.right &&
				a.bottom > b.top &&
				a.top < b.bottom
			);

	},

	/**
	 * Нормирование вектора
	 *
	 * @param object position - Координаты вектора
	 *
	 * @return number vector
	 */

	vectorNormal: function(position) {

		var len = Math.sqrt(position.x * position.x + position.y * position.y);

		return {
			x: position.x / len,
			y: position.y / len
		};

	},

	/**
	 * Получение угла между точками
	 *
	 * @param object a - Координаты начала вектора
	 * @param object b - Координаты конца вектора
	 *
	 * @return number angle
	 */

	anglePoint: function(a, b) {

		var angle = Math.atan2(a.y - b.y, b.x - a.x) * CONST.DEG;

		return (angle < 0) ?
			angle + 360 :
			angle;

	},

	/**
	 * Получение ближайших координат сетки указанноо размера
	 *
	 * @param object position - Исходящие координаты
	 * @param number size - Размер сетки
	 *
	 * @return object position
	 */

	getNearGrid: function(position, size) {

		return {
			x: (position.x < size / 2) ? 
				size / 2 : 
				Math.round(position.x / size) * size,
			y: (position.y < size / 2) ? 
				size / 2 : 
				Math.round(position.y / size) * size
		};

	},

	/**
	 * Проверка на вхождение точки в неправильную фигуру
	 *
	 * @param object point - Координаты точки
	 * @param object polygons - Массив полигонов фигуры
	 *
	 * @return boolean
	 */

	isPointInPolygons: function(point, polygons) {

		var inside = false;

		for(var i = 0, j = polygons.length - 1; i < polygons.length; j = i++) {
			if(
				((polygons[i][1] > point.y) != (polygons[j][1] > point.y)) && 
				(point.x < (polygons[j][0] - polygons[i][0]) * (point.y - polygons[i][1]) / (polygons[j][1] - polygons[i][1]) + polygons[i][0])
			) {
				inside = !inside;
			}
		}

		return inside;

	},

	/**
	 * Проверка на принадлежность точки вектору
	 *
	 * @param object point - Координаты точки
	 * @param object a - Координаты начала вектора
	 * @param object b - Координаты конца вектора
	 *
	 * @return boolean
	 */

	isPointInVector: function(point, a, b) {

		if(
			point.x > Math.max(a.x, b.x) || 
			point.x < Math.min(a.x, b.x) || 
			point.y > Math.max(a.y, b.y) || 
			point.y < Math.min(a.y, b.y)
		) {
			return false;
		}

		return (Math.abs((point.x - a.x) * (b.y - a.y) - (point.y - a.y) * (b.x - a.x)) < 0.05);

	},

	/**
	 * Сортировка массива объектов по свойству index
	 *
	 * @private
	 *
	 * @param object list - Массив объектов
	 *
	 * @return void
	 */

	_sortByIndex: function(list) {

		var cache;

		for(var i = 0; i < list.length; ++i) {
			for(var k = 0; k < list.length - i; ++k) {

				if(list[i].property.index < list[k].property.index) {
					cache = list[i];
					list[i] = list[k];
					list[k] = cache;
				}

			}
		}

	}

};
var $ = require('../engine/server/uranengine');

$.cacheSprites([
	'background.png'
]);

var mouse = { 
	x: 640,
	y: 512
};

var colorScheme = [ 255, 0, 0 ],
	colorSlot = 2,
	colorMethod = 1;

var scene = $.createScene('main.xml');

$.event('onSceneUpdate', function() {

	var particle = scene.createObject('particle', {
		position: mouse,
		velocity: $.random(5, 10),
		size: $.random(2, 4),
		background: 'rgb(' + colorScheme[0] + ',' + colorScheme[1] + ',' + colorScheme[2] + ')'
	});

	particle.setData('move', $.random(0, 359));

});

$.event('onObjectUpdate', 'particle', function() {
	this.move(this.getData('move'));
});

$.event('onObjectCollisionMap', 'particle', function() {
	this.destroy();
});

$.event('onPlayerConnect', function() {
	this.setScene(scene);
	this.setCursor('crosshair');
});

$.event('onPlayerMouseMove', function(position) {
	mouse = position;
});

$.event('onSceneUpdate', function(position) {

	if((colorScheme[colorSlot] > 0 && colorMethod == -1) || (colorScheme[colorSlot] < 255 && colorMethod == 1)) {
		colorScheme[colorSlot] += colorMethod;
	} else {
		colorMethod = -colorMethod;
		colorSlot = (colorSlot == 2) ? 0 : colorSlot + 1;
	}

});
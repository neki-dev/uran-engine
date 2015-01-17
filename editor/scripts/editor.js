$(function() {

	var canvas = document.getElementById('field'),
		ctx = canvas.getContext('2d');

	/*
	**
	*/

	var $OBJECT = {
		field: $('#field'),
		editor: $('#editor'),
		body: $('body'),
		code: $('#code')
	};

	var size = {
		width: $OBJECT.body.width() - $OBJECT.editor.width(),
		height: $OBJECT.body.height()
	}

	/*
	**
	*/

	canvas.width = size.width;
	canvas.height = size.height;

	ctx.fillStyle = 'rgba(0,0,0,0.2)';
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 2;

	/*
	**
	*/

	var POINTS = [],
		MOUSE = [],
		LASTPOINT = [],
		CLICK = [],
		MOVED_POSITION = [],
		MOVED_POINTS = [];

	var MODE = 'None';

	var OBJECT_DATA = {
		name: '',
		size: [ 200, 200 ],
		position: [ size.width/2-100, size.width/2-100 ],
		showbody: true,
		showpolygons: true,
		showsprite: true,
		fasten: false,
		collision: false,
		spriteName: ''
	};

	/*
	**
	*/

	$OBJECT.field.click(function(e) {

		if(
			e.pageX > OBJECT_DATA.position[0] && e.pageX < OBJECT_DATA.position[0]+OBJECT_DATA.size[0] &&
			e.pageY > OBJECT_DATA.position[1] && e.pageY < OBJECT_DATA.position[1]+OBJECT_DATA.size[1] &&
			MODE == 'Polygons'
		) {

			POINTS.push([ e.pageX, e.pageY ]);
			LASTPOINT = POINTS[POINTS.length-1];
			
			__updateCode();

		}

	});

	$OBJECT.field.mousedown(function(e) {
		
		CLICK = [ e.pageX, e.pageY ];
		MOVED_POSITION = OBJECT_DATA.position;
		for(var k = 0; k < POINTS.length; ++k) {
			MOVED_POINTS[k] = POINTS[k];
		}

		if(
			e.pageX > OBJECT_DATA.position[0] && e.pageX < OBJECT_DATA.position[0]+OBJECT_DATA.size[0] &&
			e.pageY > OBJECT_DATA.position[1] && e.pageY < OBJECT_DATA.position[1]+OBJECT_DATA.size[1]
		) {
			MODE = (MODE == 'None') ? 'Move' : MODE;
		}

	});

	$OBJECT.field.mouseup(function(e) {

		MODE = (MODE != 'Polygons') ? 'None' : MODE;

	});

	$OBJECT.body.mousemove(function(e) {

		MOUSE = [ e.pageX, e.pageY ];

		if(MODE == 'Move' && (OBJECT_DATA.showpolygons || OBJECT_DATA.showbody || OBJECT_DATA.showsprite)) {

			for(var k = 0; k < POINTS.length; ++k) {
				POINTS[k] = [
					MOVED_POINTS[k][0] + e.pageX - CLICK[0],
					MOVED_POINTS[k][1] + e.pageY - CLICK[1]
				];
			}

			OBJECT_DATA.position = [
				MOVED_POSITION[0] + e.pageX - CLICK[0],
				MOVED_POSITION[1] + e.pageY - CLICK[1]
			];

		}

	});

	/*
	**
	*/

	setInterval(function() {

		ctx.clearRect(0, 0, size.width, size.height);

		if(OBJECT_DATA.showbody) {
			ctx.fillRect(
				OBJECT_DATA.position[0],
				OBJECT_DATA.position[1],
				OBJECT_DATA.size[0],
				OBJECT_DATA.size[1]
			);
		}

		if(OBJECT_DATA.sprite && OBJECT_DATA.showsprite) {
			ctx.drawImage(
				OBJECT_DATA.sprite, 0, 0,
				OBJECT_DATA.size[0],
				OBJECT_DATA.size[1],
				OBJECT_DATA.position[0],
				OBJECT_DATA.position[1],
				OBJECT_DATA.size[0],
				OBJECT_DATA.size[1]
			);
		}
		
		ctx.beginPath();

		if(LASTPOINT.length) {

			if(OBJECT_DATA.showpolygons) {
				for(var k = 0; k < POINTS.length-1; ++k) {
					ctx.moveTo(POINTS[k][0], POINTS[k][1]);
					ctx.lineTo(POINTS[k+1][0], POINTS[k+1][1]);
				}
			}

			if(
				MOUSE[0] > OBJECT_DATA.position[0] && MOUSE[0] < OBJECT_DATA.position[0]+OBJECT_DATA.size[0] &&
				MOUSE[1] > OBJECT_DATA.position[1] && MOUSE[1] < OBJECT_DATA.position[1]+OBJECT_DATA.size[1] &&
				MODE == 'Polygons'
			) {
				ctx.moveTo(LASTPOINT[0], LASTPOINT[1]);
				ctx.lineTo(MOUSE[0], MOUSE[1]);
			}

		}
		
		ctx.stroke();

	}, 1000/60);

	/*
	**
	*/

	$('#data-name').change(function() {

		OBJECT_DATA.name = $(this).val();

		__updateCode();

	});

	$('#data-width').change(function() {

		OBJECT_DATA.size[0] = parseInt($(this).val()) || 0;

		__updateCode();

	});

	$('#data-height').change(function() {

		OBJECT_DATA.size[1] = parseInt($(this).val()) || 0;

		__updateCode();

	});

	$('#data-sprite').change(function() {
			
		if(this.files.length) {

			OBJECT_DATA.spriteName = this.files[0].name;

			var reader = new FileReader();
			
			reader.onload = function(e) {

				if(!OBJECT_DATA.sprite) {
					OBJECT_DATA.sprite = new Image();
				}

				OBJECT_DATA.sprite.src = e.target.result;

				OBJECT_DATA.size = [
					OBJECT_DATA.sprite.width,
					OBJECT_DATA.sprite.height
				];

				$('#data-width').val(OBJECT_DATA.sprite.width);
				$('#data-height').val(OBJECT_DATA.sprite.height);

				POINTS = [];
				LASTPOINT = [];

				__updateCode();

        	}

			reader.readAsDataURL(this.files[0]);

		}

	});

	$('#data-showbody').change(function() {

		OBJECT_DATA.showbody = !OBJECT_DATA.showbody;

	});

	$('#data-showpolygons').change(function() {

		OBJECT_DATA.showpolygons = !OBJECT_DATA.showpolygons;

	});

	$('#data-showsprite').change(function() {

		OBJECT_DATA.showsprite = !OBJECT_DATA.showsprite;

	});

	$('#data-polygons').click(function() {

		$(this).html((MODE != 'Polygons') ? 'Выключить' : 'Включить').toggleClass('active');

		MODE = (MODE != 'Polygons') ? 'Polygons' : 'None';

		$('#data-polygons-undo').toggle();

	});

	$('#data-polygons-undo').click(function() {

		if(POINTS.length > 1) {
			delete POINTS[POINTS.length--];
			LASTPOINT = POINTS[POINTS.length-1];
			__updateCode();
		}

	});

	$('#data-fasten').change(function() {

		OBJECT_DATA.fasten = !OBJECT_DATA.fasten;

		__updateCode();

	});

	$('#data-collision').change(function() {

		OBJECT_DATA.collision = !OBJECT_DATA.collision;

		__updateCode();

	});

	/*
	**
	*/

	function __updateCode() {

		var code = 'var object = createObject(';

		if(OBJECT_DATA.name.length) {
			code += '"' + OBJECT_DATA.name + '", '
		}

		code += '{';

		if(POINTS.length == 0) {
			code += '\n\tsize: [ ' + OBJECT_DATA.size[0] + ', ' + OBJECT_DATA.size[1] + ' ]';
		} else {
			code += '\n\tpolygons: [';
			for(var k = 0; k < POINTS.length; ++k) {
				code += '\n\t\t[ ' + (POINTS[k][0]-OBJECT_DATA.position[0]) + ', ' + (POINTS[k][1]-OBJECT_DATA.position[1]) + ' ]';
				if(k < POINTS.length-1) {
					code += ',';
				}
			}
			code += '\n\t]';
		}

		if(OBJECT_DATA.sprite) {
			code += ',\n\tsprite: "' + OBJECT_DATA.spriteName + '"';
		}

		if(OBJECT_DATA.fasten) {
			code += ',\n\tfasten: true';
		}

		if(OBJECT_DATA.collision) {
			code += ',\n\tcollision: true';
		}

		code += '\n});';

		$OBJECT.code.html(code);

	}

	__updateCode();

});
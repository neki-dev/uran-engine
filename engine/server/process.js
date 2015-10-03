module.exports = function(library, settings, scenes) {

	// Создание сцены для первоначального хранения игроков

	library.createScene();	

	// Вызов событий мышки для объектов и HUD

	library.event('onPlayerMouseClicked', function(mapPosition, screenPosition) {

		for(var i = 0; i < scenes[this.scene].list.object.length; ++i) {

			if(
				!scenes[this.scene].list.object[i].property.toggle ||
				!scenes[this.scene].list.object[i].isLocated(mapPosition)
			) {
				continue;
			}

			library._callEvent('onObjectClicked', scenes[this.scene].list.object[i], [ 
				this,
				mapPosition
			]);

		}

		for(var i = 0; i < scenes[this.scene].list.hud.length; ++i) {

			if(
				!scenes[this.scene].list.hud[i].property.toggle ||
				!scenes[this.scene].list.hud[i].isLocated(screenPosition) 
			) {
				continue;
			}

			library._callEvent('onHudClicked', scenes[this.scene].list.hud[i], [ 
				this,
				screenPosition
			]);

		}

	});

	library.event('onPlayerMouseMove', function(mapPosition, screenPosition) {

		for(var i = 0; i < scenes[this.scene].list.object.length; ++i) {

			if(
				scenes[this.scene].list.object[i].property.toggle &&
				scenes[this.scene].list.object[i].isLocated(mapPosition.x)
			) {

				if(!library.inArray(scenes[this.scene].list.object[i].data.mouse, this.id)) {

					scenes[this.scene].list.object[i].data.mouse.push(this.id);

					library._callEvent('onObjectMouseEnter', scenes[this.scene].list.object[i], [ 
						this,
						mapPosition
					]);

				}

			} else if(library.inArray(scenes[this.scene].list.object[i].data.mouse, this.id)) {

				library.deleteArrayValue(scenes[this.scene].list.object[i].data.mouse, this.id);

				library._callEvent('onObjectMouseLeave', scenes[this.scene].list.object[i], [ 
					this,
					mapPosition
				]);

			}

		}

		for(var i = 0; i < scenes[this.scene].list.hud.length; ++i) {

			if(
				scenes[this.scene].list.hud[i].property.toggle &&
				scenes[this.scene].list.hud[i].isLocated(screenPosition)
			) {

				if(!library.inArray(scenes[this.scene].list.hud[i].data.mouse, this.id)) {

					scenes[this.scene].list.hud[i].data.mouse.push(this.id);

					library._callEvent('onHudMouseEnter', scenes[this.scene].list.hud[i], [ 
						this,
						screenPosition
					]);

				}

			} else if(library.inArray(scenes[this.scene].list.hud[i].data.mouse, this.id)) {

				library.deleteArrayValue(scenes[this.scene].list.hud[i].data.mouse, this.id);

				library._callEvent('onHudMouseLeave', scenes[this.scene].list.hud[i], [ 
					this,
					screenPosition
				]);

			}

		}

	});

	// Уведомление о запуске сервера

	console.clear();
	console.echo('main', 'Сервер запускается...');

	setTimeout(function() {

		console.log('');
		console.echo('info', 'uranEngine ' + require('../../package').version);
		console.echo('hint', 'Сервер успешно запущен. Порт сервера: ' + settings.port);
		console.log('');

	}, 2000);

};